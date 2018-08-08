/*
  read: get, list
  write: create, update, delete
*/

import firebase from './firebase';
import 'firebase/firestore';
import alg from './algconfig';
import algoliasearch from 'algoliasearch';
import { smAlgorithm } from './algorithms';
import moment from 'moment';

// tool initializations
const db = firebase.firestore();
const storage = firebase.storage();
const storageRef = storage.ref();
const algoliaclient = algoliasearch(alg.id, alg.publicKey);

// variable declarations
const ALGOLIA_INDEX_NAME_1 = 'decks';
const ALGOLIA_INDEX_NAME_2 = 'users';
const ALGOLIA_INDEX_NAME_3 = 'lists';

// For suppressing a console error
const settings = {timestampsInSnapshots: true};
db.settings(settings);

// Begin api functions
export function getDeck(deckId) {
  let deckRef = db.collection('decks').doc(deckId);
  let cardsRef = deckRef.collection('cards');

  return Promise.all([
    deckRef.get(),
    cardsRef.get(),
  ]).then(([ deck, cards ]) => {
    let cardsArr = [];
    cards.forEach((card) => {
      cardsArr.push({
        id: card.id,
        front: card.data().front,
        back: card.data().back
      })
    });
    return {
      deckName: deck.data().name,
      creatorId: deck.data().creatorId,
      cards: cardsArr
    }
  });

}

export function getDeckForStudy(deckId) {
  const uid = firebase.auth().currentUser.uid;
  const userCardsStudiedRef = db.collection('spacedRepData')
    .where('userId', '==', uid).where('deckId', '==', deckId);

  return Promise.all([
    getDeck(deckId),
    userCardsStudiedRef.get()
  ]).then(([ deck, cardsStudiedSnapshot ]) => {
    // deck is content, fully updated.
    // cardsStudiedSnapshot is personal data. might not exist, and if so might not exist for all content.

    // turn collection of cards in cardsStudiedSnapshot into an object for easier checking.
    let cardsToBeDeleted = {};
    cardsStudiedSnapshot.forEach((card) => {
      let cardData = card.data();
      cardData.id = card.id;
      cardsToBeDeleted[card.data().cardId] = cardData;
    });

    // loop through content cards.
    let arrayDue = [];
    let arrayNew = [];
    let arrayLeft = [];
    let cardsToBeKept = {};
    deck.cards.forEach((card) => {
      if (cardsToBeDeleted[card.id]) { // card is not new.
        const { interval, nextReviewed } = cardsToBeDeleted[card.id];
        const now = new Date();
        const percentOverdue = getPercentOverdue(interval, nextReviewed.toDate(), now);

        if (percentOverdue >= 0) { // card is due.
          cardsToBeDeleted[card.id].isDue = true;
          cardsToBeDeleted[card.id].percentOverdue = percentOverdue;
          card.percentOverdue = percentOverdue;
          arrayDue.push(card); // this pushes CONTENT card with an overdue property
          cardsToBeKept[card.id] = cardsToBeDeleted[card.id];
        } 
      } else { // card is new
        if (arrayNew.length < 20) {
          arrayNew.push(card);
        } else {
          arrayLeft.push(card);
        }
        cardsToBeKept[card.id] = cardsToBeDeleted[card.id];
      }
      delete cardsToBeDeleted[card.id];

    });

    // order cards in arrayDue by percent overdue.
    arrayDue.sort((item1, item2) => {
      return item1.percentOverdue - item2.percentOverdue;
    });

    // delete cards in cardsToBeDeleted, they weren't in content.
    let batch = db.batch();
    Object.keys(cardsToBeDeleted).forEach((id) => {
      let badCardRef = db.collection('spacedRepData').doc(id);
      batch.delete(badCardRef);                         
    });

    return batch.commit().then(() => {
      return {
        name: deck.deckName,
        creator: deck.creatorId,
        arrayDue: arrayDue,
        arrayNew: arrayNew,
        arrayLeft: arrayLeft,
        personalData: cardsToBeKept
      };
    });
  })
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

  return Promise.all([listRef.get(), listRef.collection('concepts').get()]).then(([ list, concepts ]) => {
    let conceptArr = [];
    concepts.forEach((concept) => {
      conceptArr.push({
        id: concept.id,
        question: concept.data().question,
        answer: concept.data().answer
      })
    });
    return {
      listName: list.data().name,
      creatorId: list.data().creatorId,
      concepts: conceptArr
    }
  });
}

export function getConceptListForStudy(listId) {
  const uid = firebase.auth().currentUser.uid;
  let contentRef = db.collection('lists').doc(listId);
  let dataRef = db.collection('selfExData')
                  .where('userId', '==', uid).where('listId', '==', listId);

  return Promise.all([
    getConceptList(listId),
    dataRef.get()
  ]).then(([ list, dataSnapshot ]) => {
    let conceptsToBeDeleted = {};
    dataSnapshot.forEach((concept) => {
      let conceptData = concept.data();
      conceptData.id = concept.id;
      conceptsToBeDeleted[concept.data().conceptId] = conceptData;
    });
    let concepts = [];
    let conceptsToBeKept = {};
    list.concepts.forEach((concept) => {
      concepts.push(concept);
      conceptsToBeKept[concept.id] = conceptsToBeDeleted[concept.id];
      delete conceptsToBeDeleted[concept.id];
    });

    let batch = db.batch();
    Object.keys(conceptsToBeDeleted).forEach((id) => {
      let badCardRef = db.collection('selfExData').doc(id);
      batch.delete(badCardRef);
    });

    return batch.commit().then(() => {
      return {
        name: list.listName,
        creatorId: list.creatorId,
        concepts: concepts,
        conceptsAnswers: conceptsToBeKept
      };
    });
  })
}

export function getUserProfileInfo(uid) {
  return db.collection('users').doc(uid).get();
}

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

  return Promise.all([
    getUserProfileInfo(uid),
    getUserDecks(uid),
    getUserConceptLists(uid),
    getProfilePic(uid)
  ]).then((results) => {
    const [ user, decks, conceptLists, url ] = results;
    return {
      name: user.data().name,
      email: user.data().email,
      id: user.id,
      decks: decks,
      conceptLists: conceptLists,
      photoURL: url
    }
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
// end get functions

// begin create functions
export function createNewDbUser() {
  const { displayName, email, uid } = firebase.auth().currentUser;

  // temporary algolia indexing soln
  fetch('/api/addalgolia', {
    method: 'POST',
    body: JSON.stringify({
      type: 'users',
      object: {
        objectID: uid,
        name: displayName,
        email: email
      }
    }),
    headers:{
      'Content-Type': 'application/json'
    }
  });

  return Promise.all([
    db.collection('users').doc(uid).set({
      name: displayName,
      email: email
    }),
    fetch('https://i.imgur.com/nYDMVCK.jpg')
  ]).then((res) => res[1].blob()).then((res) => {
    return updateCurrentUserProfilePic(res);
  });
}

export function createDeckCurrentUser(deckName, cards) {
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
  const data = {
    name: deckName,
    creatorId: uid,
    creatorName: displayName,
    count: (cards && cards.length) || 0
  }
  return db.collection('decks').add(data).then((deckRef) => {
    // very temporary algolia index solution
    fetch('/api/addalgolia', {
      method: 'POST',
      body: JSON.stringify({
        object: Object.assign({objectID: deckRef.id}, data),
        type: 'decks'
      }),
      headers:{
        'Content-Type': 'application/json'
      }
    });
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
      if (concepts[i].question.length > 200 || concepts[i].answer.length > 4000) {
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
  }

  return db.collection('lists').add(data).then((listRef) => {
    // very temporary algolia index solution
    fetch('/api/addalgolia', {
      method: 'POST',
      body: JSON.stringify({
        object: Object.assign({objectID: listRef.id}, data),
        type: 'lists'
      }),
      headers:{
        'Content-Type': 'application/json'
      }
    });
    if (concepts) {
      // consider mixing this batch with the deck creation call
      const batch = db.batch();
      concepts.forEach((concept) => {
        const newCardRef = db.collection('lists').doc(listRef.id).collection('concepts').doc();
        if (!concept.answer) {
          concept.answer = '';
        }
        batch.set(newCardRef, {question: concept.question, answer: concept.answer});
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
    back: back,
    internal: 0
  }).then(() => {
    return updateDeckCountByOne(deckId, true);
  });
}

export function createConcept(question, answer, listId) {
  if (question.length > 200 || answer.length > 4000) {
    return Promise.reject(new Error('Concept is too long.'));
  }

  const deckRef = db.collection('lists').doc(listId);
  return deckRef.collection('concepts').add({
    question: question,
    answer: answer ? answer : ''
  }).then(() => {
    return updateListCountByOne(listId, true);
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

export function updateCardPersonalDataLearner(dataId, deckId, cardId, newInterval, newEasinessFactor) {
  const uid = firebase.auth().currentUser.uid;
  let cardRef;
  if (dataId) {
    cardRef = db.collection('spacedRepData').doc(dataId);
  } else {
    cardRef = db.collection('spacedRepData').doc();
  }
  const newNextReviewed = new Date();
  newNextReviewed.setDate(newNextReviewed.getDate() + newInterval);

  cardRef.set({
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

export function updateConcept(listId, conceptId, question, answer) {
  if (question.length > 200 || answer.length > 4000) {
    return Promise.reject(new Error('Concept is too long.'));
  }

  const cardRef = `decks/${listId}/cards/${conceptId}`;

  return db.doc(cardRef).update({ 
    question: question,
    answer: answer
  });
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

      // very temporary algolia index solution
      fetch('/api/updatealgolia', {
        method: 'POST',
        body: JSON.stringify({
          type: 'decks',
          object: {
            objectID: deckId,
            count: newCount
          }
        }),
        headers:{
          'Content-Type': 'application/json'
        }
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

      // very temporary algolia index solution
      fetch('/api/updatealgolia', {
        method: 'POST',
        body: JSON.stringify({
          type: 'lists',
          object: {
            count: newCount,
            objectID: listId
          }
        }),
        headers:{
          'Content-Type': 'application/json'
        }
      });

    })
  })
}

export function updateCurrentUserDeck(deckId, deckName, cards) {
  if (deckName.length > 150) {
    return Promise.reject(new Error('Deck name is too long.'));
  }
  const userId = firebase.auth().currentUser.uid;
  const deckRef = `decks/${deckId}`;

  // very temporary algolia index solution
  fetch('/api/updatealgolia', {
    method: 'POST',
    body: JSON.stringify({
      type: 'decks',
      object: {
        name: deckName,
        objectID: deckId
      }
    }),
    headers:{
      'Content-Type': 'application/json'
    }
  });

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
      })
    }
  });
}

export function updateCurrentUserList(listId, listName, concepts) {
  if (listName.length > 150) {
    return Promise.reject(new Error('Deck name is too long.'));
  }
  const userId = firebase.auth().currentUser.uid;
  const listRef = `lists/${listId}`

  if (listName.length > 150) {
    return Promise.reject(new Error('Deck name is too long.'));
  }

  // very temporary algolia index solution
  fetch('/api/updatealgolia', {
    method: 'POST',
    body: JSON.stringify({
      type: 'lists',
      object: {
        name: listName,
        objectID: listId
      }
    }),
    headers:{
      'Content-Type': 'application/json'
    }
  });

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
      })
    }
  });
}

export function updateCurrentUserProfilePic(file) {
  const uid = firebase.auth().currentUser.uid;
  return storageRef.child(`profilePics/${uid}`).put(file);
}
// end update functions

// begin delete functions
export function deleteCard(deckId, cardId) {
  const deckRef = db.collection('decks').doc(deckId);
  return deckRef.collection('cards').doc(cardId).delete().then(() => {
    updateDeckCountByOne(deckId, false);
  });
}

export function deleteConcept(listId, conceptId) {
  const listRef = db.collection('lists').doc(listId);
  return listRef.collection('concepts').doc(conceptId).delete().then(() => {
    updateListCountByOne(listId, false);
  });
}

export function deleteDeckFromCurrentUser(deckId) {
  console.log('hello', deckId)
  return firebase.auth().currentUser.getIdToken(true).then((token) => {
    const data = {
      token: token,
      uid: firebase.auth().currentUser.uid, 
      deckId: deckId
    }
    return fetch('/api/deletedeck', {
      method: 'POST',
      body: JSON.stringify(data),
      headers:{
        'Content-Type': 'application/json'
      }
    });
  })
}

export function deleteListFromCurrentUser(listId) {
  return firebase.auth().currentUser.getIdToken(true).then((token) => {
    const data = {
      token: token,
      uid: firebase.auth().currentUser.uid, 
      listId: listId
    }
    return fetch('/api/deletelist', {
      method: 'POST',
      body: JSON.stringify(data),
      headers:{
        'Content-Type': 'application/json'
      }
    });
  })
}
// end delete functions

// begin search functions
export function searchDecks(query) {

  if (query.length > 1000) {
    return Promise.reject(new Error('Query is too long.'));
    // add algolia check
  }
  return new Promise((resolve, reject) => {
    const index = algoliaclient.initIndex(ALGOLIA_INDEX_NAME_1);
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
  })
}

export function searchUsers(query) {
  if (query.length > 1000) {
    return Promise.reject(new Error('Query is too long.'));
  }
  return new Promise((resolve, reject) => {
    const index = algoliaclient.initIndex(ALGOLIA_INDEX_NAME_2);
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
  })
}

export function searchLists(query) {
  if (query.length > 1000) {
    return Promise.reject(new Error('Query is too long.'));
  }
  return new Promise((resolve, reject) => {
    const index = algoliaclient.initIndex(ALGOLIA_INDEX_NAME_3);
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
  })
}
// end search functions

