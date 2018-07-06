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
const ALGOLIA_INDEX_NAME_3 = 'conceptlists';

// For suppressing a console error
const settings = {timestampsInSnapshots: true};
db.settings(settings);

// Begin get functions
export function getProfilePic(uid) {
  return storageRef.child(`profilePics/${uid}`).getDownloadURL();
}

export function getDeck(deckId) {
  let deckRef = db.collection('decks').doc(deckId);

  return Promise.all([
    deckRef.get(),
    deckRef.collection('cards').get(),
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
  const userCardsStudiedRef = db.collection('users').doc(uid)
                                .collection('studiedDecks').doc(deckId)
                                .collection('cards');

  return Promise.all([
    getDeck(deckId),
    userCardsStudiedRef.get()
  ]).then(([ deck, cardsStudiedSnapshot ]) => {
    // deck is content, fully updated.
    // cardsStudiedSnapshot is personal data. might not exist, and if so might not exist for all content.

    // turn collection of cards in cardsStudiedSnapshot into an object for easier checking.
    let cardsToBeDeleted = {};
    cardsStudiedSnapshot.forEach((card) => {
      cardsToBeDeleted[card.id] = card.data();
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
      } else {
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
      let badCardRef = db.collection('users').doc(uid)
                         .collection('studiedDecks').doc(deckId)
                         .collection('cards').doc(id);
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

  console.log(currentMoment);
  console.log(dueMoment);
  console.log(currentMoment.diff(dueMoment, 'days')); 

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
  let dataRef = db.collection('users').doc(uid)
                  .collection('studiedLists')
                  .where('listId', '==', listId);


  return Promise.all([
    getConceptList(listId),
    dataRef.get()
  ]).then(([ list, dataSnapshot ]) => {
    let conceptsToBeDeleted = {};
    dataSnapshot.forEach((concept) => {
      conceptsToBeDeleted[concept.id] = concept.data();
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
      let badCardRef = db.collection('users').doc(uid)
                         .collection('studiedLists').doc(id);
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

export function getUser(uid) {
  let userRef = db.collection('users').doc(uid);
  let userDecksQuery = db.collection('decks').where('creatorId', '==', uid);

  return Promise.all([
    userRef.get(),
    userDecksQuery.get(),
    getProfilePic(uid)
  ]).then((results) => {
    const [ user, decks, url ] = results;
    let decksArr = [];
    decks.forEach((deck) => {
      decksArr.push({
        id: deck.id,
        name: deck.data().name,
      })
    });
    return {
      name: user.data().name,
      email: user.data().email,
      id: user.id,
      decks: decksArr,
      photoURL: url
    }
  });
}

export function getCurrentUserDecks() {
  const uid = firebase.auth().currentUser.uid;
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

export function getCurrentUserConceptLists() {
  const uid = firebase.auth().currentUser.uid;
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

export function getCurrentUser() {
  const uid = firebase.auth().currentUser.uid;
  return getUser(uid);
}

export function getCurrentUserProfilePic() {
  const uid = firebase.auth().currentUser.uid;
  return getProfilePic(uid);
}
// end get functions

// begin create functions
export function createNewDbUser() {
  const { displayName, email, uid } = firebase.auth().currentUser;

  // temporary algolia indexing soln
  fetch('/api/addalgoliauser', {
    method: 'POST',
    body: JSON.stringify({
      uid: uid,
      name: displayName,
      email: email
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
      body: JSON.stringify(Object.assign({deckId: deckRef.id}, data)),
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
  const { uid, displayName } = firebase.auth().currentUser;

  const data = {
    name: conceptListName,
    creatorId: uid,
    creatorName: displayName,
    count: (concepts && concepts.length) || 0
  }

  return db.collection('lists').add(data).then((listRef) => {
    // // very temporary algolia index solution
    // fetch('/api/addalgolia', {
    //   method: 'POST',
    //   body: JSON.stringify(Object.assign({deckId: listRef.id}, data)),
    //   headers:{
    //     'Content-Type': 'application/json'
    //   }
    // });
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
export function updateCardPersonalData(deckId, cardId, oldEasinessFactor, oldInterval, quality) {
  const uid = firebase.auth().currentUser.uid;
  const cardRef = db.collection('users').doc(uid)
                    .collection('studiedDecks').doc(deckId)
                    .collection('cards').doc(cardId);

  const  [ newEasinessFactor, newInterval ] = smAlgorithm(oldEasinessFactor, oldInterval, quality);
  const newNextReviewed = new Date();
  newNextReviewed.setDate(newNextReviewed.getDate()  + newInterval);

  cardRef.set({
    easinessFactor: newEasinessFactor,
    interval: newInterval,
    nextReviewed: newNextReviewed,
    isDue: false,
    percentOverdue: 0
  }, { merge: true });
}

export function updateCard(deckId, cardId, front, back) {
  const cardRef = `decks/${deckId}/cards/${cardId}`;

  return db.doc(cardRef).update({ 
    front: front,
    back: back
  });
}

export function updateConcept(listId, conceptId, question, answer) {
  const cardRef = `decks/${listId}/cards/${conceptId}`;

  return db.doc(cardRef).update({ 
    question: question,
    answer: answer
  });
}

export function updateConceptPersonalData(listId, cardId, newAnswer) {
  const uid = firebase.auth().currentUser.uid;
  const dataRef = db.collection('users').doc(uid)
                    .collection('studiedLists').doc(cardId);


  return dataRef.set({
    answer: newAnswer,
    listId: listId
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
          count: newCount,
          deckId: deckId
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

      // // very temporary algolia index solution
      // fetch('/api/updatealgolia', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     count: newCount,
      //     listId: listId
      //   }),
      //   headers:{
      //     'Content-Type': 'application/json'
      //   }
      // });

    })
  })
}

export function updateCurrentUserDeck(deckId, deckName) {
  const userId = firebase.auth().currentUser.uid;
  const deckRef = `decks/${deckId}`

  // very temporary algolia index solution
  fetch('/api/updatealgolianame', {
    method: 'POST',
    body: JSON.stringify({
      name: deckName,
      deckId: deckId
    }),
    headers:{
      'Content-Type': 'application/json'
    }
  });

  return db.doc(deckRef).update({name: deckName});
}

export function updateCurrentUserList(listId, listName) {
  const userId = firebase.auth().currentUser.uid;
  const listRef = `lists/${listId}`

  // // very temporary algolia index solution
  // fetch('/api/updatealgolianame', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     name: listName,
  //     listId: listId
  //   }),
  //   headers:{
  //     'Content-Type': 'application/json'
  //   }
  // });

  return db.doc(listRef).update({name: listName});
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
// end search functions

