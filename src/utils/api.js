import firebase from './firebase';
import 'firebase/firestore';
import { deckIndex, userIndex, listIndex, algClient } from './algconfig';
import { smAlgorithm } from './algorithms';
import moment from 'moment';

// tool initializations
const db = firebase.firestore();
const storage = firebase.storage();
const storageRef = storage.ref();

// For suppressing a console error
const settings = {timestampsInSnapshots: true};
db.settings(settings);

// Begin api functions

/**
 * Gets info for a deck -- the deck's creatorId, count, creator name,
 *    name, and ID.
 *
 * @param {String} deckId - The ID of the desired deck
 *
 * @return {Object} An object with the deck's info, with properties "id", "count",
 *    "creatorId", "creatorName", and "name"
 */
export function getDeckInfo(deckId) {
  // set and get database reference
  const cardRef = db.collection('decks').doc(deckId);
  return cardRef.get().then((res) => {
    if (!res.exists) {
      throw new Error('This deck doesn\'t exist.');
    }
    const dataToReturn = res.data();
    dataToReturn.id = res.id;
    return dataToReturn;
  });
}

/**
 * Gets info for a card -- the card's front and back
 *
 * @param {String} deckId - The ID of the desired card's deck
 * @param {String} cardId - the ID of the desired card
 *
 * @return {Object} An object with the card's info, with properties "front", "back",
 *    and "id"
 */
export function getCardInfo(deckId, cardId) {
  // set and get database reference
  const cardRef = db.collection('decks').doc(deckId).collection('cards').doc(cardId);
  return cardRef.get().then((res) => {
    return {
      front: res.data().front,
      back: res.data().back,
      id: res.id
    };
  });
}

/**
 * Gets info for multiple cards
 *
 * @param {String} an array of objects, each object with attributes 'cardId' and 'deckId' both
 *    of type String. The object can have other attributes, which will not affect the execution
 *    of this function, including the return value.
 *
 * @return {Object} An object with cardId's (String) as the key, and an object with attributes
 *    'deckId', 'front', and 'back' as the value
 */
export function getCardsInfo(cards) {
  // set up for Promise.all call to get card documents
  const calls = [];
  cards.forEach((obj) => {
    const cardRef = db.collection('decks').doc(obj.deckId).collection('cards').doc(obj.cardId);
    calls.push(cardRef.get());
  });

  // get card documents
  return Promise.all(calls).then((result) => {
    const toReturn = {};
    result.forEach((res, i) => {
      toReturn[cards[i].cardId] = {
        deckId: cards[i].deckId,
        front: res.data().front,
        back: res.data().back
      };
    });
    return toReturn;
  });
}

/**
 * Gets a classroom's information (such as id, name, periods)
 * 
 * @param {String} the ID of the desired classroom
 *
 * @return A promise resolving to a classroom object with the attributes "id",
 *    "name", "periods" (array), and "teacherId"
 */
export function getClassroomInfo(classroomId) {
  const docRef = db.collection('classrooms').doc(classroomId);
  return docRef.get().then((res) => {
    if (!res.exists) {
      throw new Error(`This classroom does not exist. Invalid ID ${classroomId}`);
    }
    return {
      id: res.id,
      name: res.data().name,
      periods: res.data().periods,
      teacherId: res.data().teacherId
    };
  });
}

/**
 * Gets the contents of a deck.
 *
 * @param {String} deckId -- the ID of the desired deck.
 *
 * @return a Promise that resolves with an object containing the deck's content. The
 *    object's attributes are deckName (the deck's name), creatorId (the ID of the
 *    deck's creator), periods (the deck's periods if this is a classroom deck, null otherwise),
 *    and cards (an array of card objects). A card object's attributes
 *    are id (the ID of the card in the deck), front (the card's front content), and
 *    back (the card's back content).
 */
export function getDeck(deckId) {
  let deckRef = db.collection('decks').doc(deckId);
  let cardsRef = deckRef.collection('cards');

  return Promise.all([
    deckRef.get(),
    cardsRef.get(),
  ]).then(([ deck, cards ]) => {
    if (!deck.exists) {
      throw new Error('This deck doesn\'t exist.');
    }
    let cardsArr = [];
    cards.forEach((card) => {
      cardsArr.push({
        id: card.id,
        front: card.data().front,
        back: card.data().back
      });
    });
    return {
      deckName: deck.data().name,
      creatorId: deck.data().creatorId,
      periods: deck.data().periods,
      cards: cardsArr
    };
  });
}

/**
 * Gets a deck for studying. 
 *
 * @param {String} deckId -- the ID of the desired deck.
 *
 * @return a Promise that resolves with an object containing the user's data on that
 *    deck, the name of the deck, the ID of the creator, and TODO: finish
 *    
 */
export function getDeckForStudy(deckId) {
  // set DB references
  const uid = firebase.auth().currentUser.uid;
  const userCardsStudiedRef = db.collection('spacedRepData')
    .where('userId', '==', uid)
    .where('deckId', '==', deckId);

  // get card content and user data from DB
  return Promise.all([
    getDeck(deckId),
    userCardsStudiedRef.get()
  ]).then(([ deck, data ]) => {
    // deck is content, fully updated.
    // data is personal data. might not exist, and if so might not exist for all content.

    // turn collection of cards in data into an object for easier checking
    // cardDataObj has the structure:
    //    {
    //      cardId: {
    //        easinessFactor: ...,
    //        interval: ...,
    //         ...other data attributes from a card data doc...,
    //        id: dataId
    //      }
    //    }
    let cardDataObj = {};
    data.forEach((cardDataPoint) => {
      let cardData = cardDataPoint.data();
      cardData.id = cardDataPoint.id;
      cardDataObj[cardDataPoint.data().cardId] = cardData;
    });

    // Loop through content cards, attach each card's respective data
    //    to itself as an attribute, and divide into "due", "new", and
    //    "left" categories
    let arrayDue = [];
    let arrayNew = [];
    let arrayLeft = [];
    deck.cards.forEach((card) => {
      if (cardDataObj[card.id]) { // card is not new.
        const { interval, nextReviewed } = cardDataObj[card.id];
        const now = new Date();
        const percentOverdue = getPercentOverdue(interval, nextReviewed.toDate(), now);

        if (percentOverdue >= 0) { // card is due.
          cardDataObj[card.id].isDue = true;
          cardDataObj[card.id].percentOverdue = percentOverdue;
          card.data = cardDataObj[card.id];
          arrayDue.push(card);
        }
      } else { // card is new
        card.data = null;
        if (arrayNew.length < 20) {
          arrayNew.push(card);
        } else {
          arrayLeft.push(card);
        }
      }
    });

    // order cards in arrayDue by percent overdue.
    arrayDue.sort((item1, item2) => {
      return item1.data.percentOverdue - item2.data.percentOverdue;
    });

    return {
      name: deck.deckName,
      creatorId: deck.creatorId,
      arrayDue: arrayDue,
      arrayNew: arrayNew,
      arrayLeft: arrayLeft,
    };

  });
}

function getPercentOverdue(interval, due_date, current_date) {
  const currentMoment = moment(current_date).startOf('day');
  const dueMoment = moment(due_date).startOf('day');
  const percentOverdue = currentMoment.diff(dueMoment, 'days') / interval;
  if (percentOverdue >= 2) {
    return 2;
  } else {
    return percentOverdue;
  }
}

export function getConceptList(listId) {
  let listRef = db.collection('lists').doc(listId);

  return Promise.all([
    listRef.get(), 
    listRef.collection('concepts').get()
  ]).then(([ list, concepts ]) => {
    if (!list.exists) {
      throw new Error('This list doesn\'t exist.');
    }
    let conceptArr = [];
    concepts.forEach((concept) => {
      conceptArr.push({
        id: concept.id,
        question: concept.data().question
      });
    });
    return {
      listName: list.data().name,
      creatorId: list.data().creatorId,
      concepts: conceptArr
    };
  });
}

export function getConceptListForStudy(listId) {
  const uid = firebase.auth().currentUser.uid;
  let dataRef = db.collection('selfExData')
    .where('userId', '==', uid).where('listId', '==', listId);

  return Promise.all([
    getConceptList(listId),
    dataRef.get()
  ]).then(([ list, dataSnapshot ]) => {
    let dataRecord = {};
    dataSnapshot.forEach((datapt) => {
      let conceptData = datapt.data();
      conceptData.id = datapt.id;
      dataRecord[datapt.data().conceptId] = conceptData;
    });

    let concepts = [];
    list.concepts.forEach((concept) => {
      concept.data = dataRecord[concept.id];
      concepts.push(concept);
    });

    return {
      name: list.listName,
      creatorId: list.creatorId,
      concepts: concepts
    };
  });
}

export function getUserProfileInfo(uid) {
  return db.collection('users').doc(uid).get().then((res) => {
    if (!res.exists) {
      throw new Error('This user does not exist.');
    }
    return res;
  });
}

/**
 * Gets the profile pic URL of a user.
 *
 * @param {String} uid - the ID of the user
 *
 * @return A Promise resolving to the profile pic URL of the desired user.
 */
export function getProfilePic(uid) {
  return storageRef.child(`profilePics/${uid}`).getDownloadURL();
}

export function getUserDecks(uid) {
  return db.collection('decks').where('creatorId', '==', uid).get()
    .then((querySnapshot) => {
      let decksArr = [];
      querySnapshot.forEach((deck) => {
        decksArr.push({
          id: deck.id,
          name: deck.data().name
        });
      });
      return decksArr;
    });
}

export function getUserConceptLists(uid) {
  return db.collection('lists').where('creatorId', '==', uid).get()
    .then((querySnapshot) => {
      let listsArr = [];
      querySnapshot.forEach((conceptList) => {
        listsArr.push({
          id: conceptList.id,
          name: conceptList.data().name
        });
      });
      return listsArr;
    });
}

export function getUserAll(uid) {
  // get user profile info first to allow error to catch if this user doesn't exist
  return getUserProfileInfo(uid).then((res) => {
    return Promise.all([
      Promise.resolve(res),
      getUserDecks(uid),
      getUserConceptLists(uid),
      getProfilePic(uid)
    ]);
  }).then((results) => {
    const [ user, decks, conceptLists, url ] = results;
    return {
      name: user.data().name,
      email: user.data().email,
      id: user.id,
      decks: decks,
      conceptLists: conceptLists,
      photoURL: url
    };
  });
}

export function getCurrentUser() {
  const uid = firebase.auth().currentUser.uid;
  return getUserAll(uid);
}

export function getCurrentUserDecks() {
  const uid = firebase.auth().currentUser.uid;
  return getUserDecks(uid);
}

export function getCurrentUserConceptLists() {
  const uid = firebase.auth().currentUser.uid;
  return getUserConceptLists(uid);
}

export function getCurrentUserProfilePic() {
  const uid = firebase.auth().currentUser.uid;
  return getProfilePic(uid);
}

export function getCurrentUserProfileInfo() {
  const uid = firebase.auth().currentUser.uid;
  return getUserProfileInfo(uid);
}

export function getDecksInClassroom(classroomId, period) {
  let colRef;
  if (period) {
    colRef = db.collection('decks').where('classroomId', '==', classroomId).where(`periods.${period}`, '==', true);
  } else {
    colRef = db.collection('decks').where('classroomId', '==', classroomId);
  }
  return colRef.get();
}

export function getClassroomUser(classroomId, userId) {
  const docRef = db.collection('classrooms').doc(classroomId)
    .collection('users').doc(userId);

  return docRef.get();
}

export function getClassroomCurrentUser(classroomId) {
  const uid = firebase.auth().currentUser.uid;
  
  return getClassroomUser(classroomId, uid);
}

/*
 * Gets classroom information for the current user, which includes classroom's user doc,
 *    classroom doc, and all decks assigned to the current user's period.
 *
 * @param {String} classroomId - the ID of the desired classroom
 *
 * @return -- a Promise resolving to an object with attributes 'data' (Firebase result for
 *    classroom document), 'id' (ID of the classroom), 'period', and 'decks'. An object
 *    in 'decks' is a Firebase result for a deck doc
 *
 */
export function getClassroomForUser(classroomId) {
  return Promise.all([
    getClassroomCurrentUser(classroomId),
    getClassroomInfo(classroomId)
  ]).then((result) => {
    const period = result[0].data().period;
    return Promise.all([
      getDecksInClassroom(classroomId, period),
      Promise.resolve(result[0]),
      Promise.resolve(result[1])
    ]);
  }).then((result) => {
    const [ decksRes, classUserRes, classRes ] = result;
    let decks = [];
    decksRes.forEach((deck) => {
      decks.push(deck);
    });
    return {
      data: classRes,
      id: classRes.id, // TODO: is this even necessary?
      period: classUserRes.data().period,
      decks: decks
    };
  });

}

export function getUserOnLogin() {
  const uid = firebase.auth().currentUser.uid;
  const userRef = db.collection('users').doc(uid);
  return userRef.get().then((userDocSnapshot) => {
    if (userDocSnapshot.exists) {
      return {
        isTeacher: userDocSnapshot.data().isTeacher,
        exists: true
      };
    } else {
      return {
        exists: false
      };
    }
  });
}

// end get functions

// begin create functions

export function createClassroomUser(code) {
  const codeParts = code.split('-&');
  if (codeParts.length != 2) {
    return new Promise((resolve, reject) => {
      reject(new Error('invalid code'));
    });
  } else {
    const [ classroomId, period ] = codeParts;
    const uid = firebase.auth().currentUser.uid;
    const userRef = db.collection('users').doc(uid);
    const classroomRef = db.collection('classrooms').doc(classroomId);

    return Promise.all([
      db.runTransaction((t) => {
        return t.get(userRef).then((res) => {
          let classrooms = res.data().classrooms;
          if (classrooms) {
            classrooms.push(classroomId);
          } else {
            classrooms = [classroomId];
          }
          t.update(userRef, {
            classrooms: classrooms
          });
        });
      }),
      classroomRef.collection('users').doc(uid).set({
        period: period
      })
    ]);
    
  }
}

export function createNewDbUser(isTeacher) {
  const { displayName, email, uid } = firebase.auth().currentUser;

  return Promise.all([
    db.collection('users').doc(uid).set({
      name: displayName,
      email: email,
      isTeacher: isTeacher
    }),
    fetch('https://i.imgur.com/nYDMVCK.jpg')
  ]).then((res) => res[1].blob()).then((res) => {
    return updateCurrentUserProfilePic(res);
  });
}

export function createDeckCurrentUser(params) {
  const { deckName, cards, isForClassroom, classroomId, periods } = params;
  if (deckName.length > 150) {
    return Promise.reject(new Error('Deck name is too long.'));
  } else {
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].front.length > 1000 || cards[i].back.length > 1000) {
        return Promise.reject(new Error('One of the card inputs is too long.'));
      }
    }
  }
  const { uid, displayName } = firebase.auth().currentUser;
  let data = {
    name: deckName,
    creatorId: uid,
    creatorName: displayName,
    count: (cards && cards.length) || 0
  };
  if (isForClassroom) {
    let periodObject = {};
    periods.forEach((period) => {
      periodObject[period] = true;
    });
    data.isClassroomPrivate = true;
    data.periods = periodObject;
    data.classroomId = classroomId;
  }

  return db.collection('decks').add(data).then((deckRef) => {
    if (cards) {
      // consider mixing this batch with the deck creation call
      const batch = db.batch();
      cards.forEach((card) => {
        const newCardRef = db.collection('decks').doc(deckRef.id).collection('cards').doc();
        batch.set(newCardRef, {front: card.front, back: card.back});
      });
      return batch.commit();
    }
  });
}

export function createConceptListCurrentUser(conceptListName, concepts) {
  if (conceptListName.length > 1000) {
    return Promise.reject(new Error('Deck name is too long.'));
  } else {
    for (let i = 0; i < concepts.length; i++) {
      if (concepts[i].question.length > 200) {
        return Promise.reject(new Error('Concept is too long.'));
      }
    }
  }

  const { uid, displayName } = firebase.auth().currentUser;

  const data = {
    name: conceptListName,
    creatorId: uid,
    creatorName: displayName,
    count: (concepts && concepts.length) || 0
  };

  return db.collection('lists').add(data).then((listRef) => {
    if (concepts) {
      // consider mixing this batch with the deck creation call
      const batch = db.batch();
      concepts.forEach((concept) => {
        const newCardRef = db.collection('lists').doc(listRef.id).collection('concepts').doc();
        batch.set(newCardRef, { question: concept.question });
      });
      return batch.commit();
    }
  });
}

export function createCard(front, back, deckId) {
  if (front.length > 1000 || back.length > 1000) {
    return Promise.reject(new Error('One of the card inputs is too long.'));
  }
  const deckRef = db.collection('decks').doc(deckId);
  return deckRef.collection('cards').add({
    front: front,
    back: back
  }).then(() => {
    return updateDeckCountByOne(deckId, true);
  });
}

export function createConcept(question, listId) {
  if (question.length > 200) {
    return Promise.reject(new Error('Concept is too long.'));
  }
  const deckRef = db.collection('lists').doc(listId);

  return deckRef.collection('concepts').add({ question: question }).then(() => {
    return updateListCountByOne(listId, true);
  });
}

export function createClassDataPoint(params) {
  const { quality, time, cardId, deckId, classroomId, period } = params;
  const uid = firebase.auth().currentUser.uid;

  return db.collection('classSpacedRepData').add({
    timestamp: new Date(),
    quality: quality,
    time: time,
    cardId: cardId,
    deckId: deckId,
    userId: uid,
    classroomId: classroomId,
    period: period
  });
}
// end create functions

// begin update functions
export function updateCardPersonalData(dataId, deckId, cardId, oldEasinessFactor, oldInterval, quality) {
  const uid = firebase.auth().currentUser.uid;
  let cardRef;
  if (dataId) {
    cardRef = db.collection('spacedRepData').doc(dataId);
  } else {
    cardRef = db.collection('spacedRepData').doc();
  }

  const  [ newEasinessFactor, newInterval ] = smAlgorithm(oldEasinessFactor, oldInterval, quality);
  const newNextReviewed = new Date();
  newNextReviewed.setDate(newNextReviewed.getDate() + newInterval);

  cardRef.set({
    easinessFactor: newEasinessFactor,
    interval: newInterval,
    nextReviewed: newNextReviewed,
    isDue: false,
    percentOverdue: 0,
    deckId: deckId,
    userId: uid,
    cardId: cardId

  }, { merge: true });
}

export function updateCardPersonalDataLearner(dataId, deckId, cardId, quality, newEasinessFactor) {
  const uid = firebase.auth().currentUser.uid;
  let cardRef;
  if (dataId) {
    cardRef = db.collection('spacedRepData').doc(dataId);
  } else {
    cardRef = db.collection('spacedRepData').doc();
  }

  let newInterval;
  if (quality == 2) {
    newInterval = 1;
  } else if (quality == 3) {
    newInterval = 3;
  } else {
    throw new Error('invalid quality submitted -- aborting!');
  }

  const newNextReviewed = new Date();
  newNextReviewed.setDate(newNextReviewed.getDate() + newInterval);

  return cardRef.set({
    easinessFactor: newEasinessFactor || 2.5,
    interval: newInterval,
    nextReviewed: newNextReviewed,
    isDue: false,
    percentOverdue: 0,
    deckId: deckId,
    userId: uid,
    cardId: cardId
  }, { merge: true });
}

export function updateCard(deckId, cardId, front, back) {
  if (front.length > 1000 || back.length > 1000) {
    return Promise.reject(new Error('One of the card inputs is too long.'));
  }

  const cardRef = `decks/${deckId}/cards/${cardId}`;

  return db.doc(cardRef).update({ 
    front: front,
    back: back
  });
}

export function updateConcept(listId, conceptId, question) {
  if (question.length > 200) {
    return Promise.reject(new Error('Concept is too long.'));
  }

  const cardRef = `lists/${listId}/concepts/${conceptId}`;

  return db.doc(cardRef).update({ question: question });
}

export function updateConceptPersonalData(dataId, listId, conceptId, answer) {
  if (answer.length > 4000) {
    return Promise.reject(new Error('Answer is too long.'));
  }

  const uid = firebase.auth().currentUser.uid;
  let dataRef;
  if (dataId) {
    dataRef = db.collection('selfExData').doc(dataId);
  } else {
    dataRef = db.collection('selfExData').doc();
  }

  return dataRef.set({
    answer: answer,
    listId: listId,
    conceptId: conceptId,
    userId: uid
  }, {merge: true});
}

function updateDeckCountByOne(deckId, isIncrement) {
  const deckRef = db.collection('decks').doc(deckId);
  const modifier = isIncrement ? 1 : -1;

  return db.runTransaction((t) => {
    return t.get(deckRef).then((res) => {
      if (!res.exists) {
        throw new Error('deck does not exist.');
      }

      let newCount = res.data().count + modifier;
      t.update(deckRef, {
        count: newCount
      });

    })
  })
}

function updateListCountByOne(listId, isIncrement) {
  const listRef = db.collection('lists').doc(listId);
  const modifier = isIncrement ? 1 : -1;

  return db.runTransaction((t) => {
    return t.get(listRef).then((res) => {
      if (!res.exists) {
        throw new Error('concept list does not exist.');
      }

      let newCount = res.data().count + modifier;
      t.update(listRef, {
        count: newCount
      });

    })
  })
}

export function updateCurrentUserDeck(deckId, deckName, cards) {
  if (deckName.length > 150) {
    return Promise.reject(new Error('Deck name is too long.'));
  }
  const deckRef = `decks/${deckId}`;

  return db.doc(deckRef).update({name: deckName}).then(() => {
    if (cards) {
      const batch = db.batch();
      cards.forEach((card) => {
        let cardRef;
        if (card.id) {
          cardRef = db.collection('decks').doc(deckId)
            .collection('cards').doc(card.id);
        } else {
          cardRef = db.collection('decks').doc(deckId)
            .collection('cards').doc();
        }
        batch.set(cardRef, {
          front: card.front,
          back: card.back
        }, {merge: true});

        return batch.commit();
      });
    }
  });
}

export function updateCurrentUserList(listId, listName, concepts) {
  if (listName.length > 150) {
    return Promise.reject(new Error('Deck name is too long.'));
  }
  const listRef = `lists/${listId}`;

  if (listName.length > 150) {
    return Promise.reject(new Error('Deck name is too long.'));
  }

  return db.doc(listRef).update({name: listName}).then(() => {
    if (concepts) {
      const batch = db.batch();
      concepts.forEach((concept) => {
        let conceptRef;
        if (concept.id) {
          conceptRef = db.collection('lists').doc(listId)
            .collection('concepts').doc(concept.id);
        } else {
          conceptRef = db.collection('lists').doc(listId)
            .collection('concepts').doc();
        }
        batch.set(conceptRef, {
          front: concept.front,
          back: concept.back
        }, {merge: true});
        return batch.commit();
      });
    }
  });
}

export function updateCurrentUserProfilePic(file) {
  const uid = firebase.auth().currentUser.uid;
  return storageRef.child(`profilePics/${uid}`).put(file);
}

// end update functions

// begin delete functions

// removes a card's content documents from the database.
export function deleteCard(deckId, cardId) {
  const deckRef = db.collection('decks').doc(deckId);
  return deckRef.collection('cards').doc(cardId).delete().then(() => {
    updateDeckCountByOne(deckId, false);
  });
}

// removes a concept's content documents from the database.
export function deleteConcept(listId, conceptId) {
  const listRef = db.collection('lists').doc(listId);
  return listRef.collection('concepts').doc(conceptId).delete().then(() => {
    updateListCountByOne(listId, false);
  });
}

export function deleteDeckFromCurrentUser(deckId) {
  const deckRef = db.collection('decks').doc(deckId);
  return deckRef.delete();
}

export function deleteListFromCurrentUser(listId) {
  const listRef = db.collection('lists').doc(listId);
  return listRef.delete();
}
// end delete functions

// begin search functions
export function searchDecks(query) {

  if (query.length > 1000) {
    return Promise.reject(new Error('Query is too long.'));
  }
  return new Promise((resolve, reject) => {
    const index = algClient.initIndex(deckIndex);
    index.search(
      {
        query: query,
        hitsPerPage: 50,
      },
      (err, content) => {
        if (err) {
          reject(err);
        }
        resolve(content.hits);
      }
    );  
  });
}

export function searchUsers(query) {
  if (query.length > 1000) {
    return Promise.reject(new Error('Query is too long.'));
  }
  return new Promise((resolve, reject) => {
    const index = algClient.initIndex(userIndex);
    index.search(
      {
        query: query,
        hitsPerPage: 50,
      },
      (err, content) => {
        if (err) {
          reject(err);
        }
        resolve(content.hits);
      }
    );  
  });
}

export function searchLists(query) {
  if (query.length > 1000) {
    return Promise.reject(new Error('Query is too long.'));
  }
  return new Promise((resolve, reject) => {
    const index = algClient.initIndex(listIndex);
    index.search(
      {
        query: query,
        hitsPerPage: 50,
      },
      (err, content) => {
        if (err) {
          reject(err);
        }
        resolve(content.hits);
      }
    );  
  });
}
// end search functions

async function main() {
  try {
    const args = [
      {
        cardId: 'MVJo0hPXhc34pl5a8cDi',
        deckId: '39Afm0PZBMrTvIKEMfCS'
      },
      {
        cardId: 'PFpNVI9fYB6RX6zGmyQN',
        deckId: '39Afm0PZBMrTvIKEMfCS'
      },
      {
        cardId: '0gcyzyO1Q1QN8P1dvshA',
        deckId: 'Cm4nLlNNOZZClH61G2CM'
      },
    ];
    const res = await getCardsInfo(args);
    console.log(res);
  } catch (e) {
    console.log(e);
  }
}

// main();