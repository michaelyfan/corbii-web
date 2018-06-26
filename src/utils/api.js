import firebase from './firebase';
import 'firebase/firestore';
import alg from './algconfig';
import algoliasearch from 'algoliasearch';

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

export function getProfilePic(uid) {
  return storageRef.child(`profilePics/${uid}`).getDownloadURL();
}

export async function getDeck(deckId) {
  let deckRef = db.collection('decks').doc(deckId);

  const [ deck, cards ] = await Promise.all([deckRef.get(), deckRef.collection('cards').get()])
    .catch((err) => {
      console.warn(err);
      return null;
    })

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
}

export async function getConceptList(listId) {
  let listRef = db.collection('lists').doc(listId);

  const [ list, concepts ] = await Promise.all([listRef.get(), listRef.collection('concepts').get()])
    .catch((err) => {
      console.warn(err);
      return null;
    })

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
}

export function getUser(uid) {
  let userRef = db.collection('users').doc(uid);

  return Promise.all([
    userRef.get(),
    userRef.collection('decks').get(),
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
  const userId = firebase.auth().currentUser.uid;
  return db.collection('users').doc(userId).collection('decks').get()
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
  const userId = firebase.auth().currentUser.uid;
  return db.collection('users').doc(userId).collection('lists').get()
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
    fetch('https://i.imgur.com/nYDMVCK.jpg').then((res) => res.blob()).then((res) => {
      updateProfilePic(res);
    })
  ]);
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

    return db.collection('users').doc(uid).collection('decks').doc(deckRef.id).set(data).then(() => {
      if (cards) {
        // consider mixing this batch with the deck creation call
        const batch = db.batch();
        cards.forEach((card) => {
          const newCardRef = db.collection('decks').doc(deckRef.id).collection('cards').doc();
          batch.set(newCardRef, {front: card.front, back: card.back});
        });
        return batch.commit();
      }
    })
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
    console.log('here 1');
    return db.collection('users').doc(uid).collection('lists').doc(listRef.id).set(data).then(() => {
      console.log('here 2');
      if (concepts) {
        // consider mixing this batch with the deck creation call
        console.log('here 3');
        const batch = db.batch();
        concepts.forEach((concept) => {
          console.log('here 4');
          const newCardRef = db.collection('lists').doc(listRef.id).collection('concepts').doc();
          console.log('here 5');
          if (!concept.answer) {
            concept.answer = '';
          }
          console.log(concepts);
          console.log(concept);
          batch.set(newCardRef, {question: concept.question, answer: concept.answer});
          console.log('here 6');
        });
        console.log('here 7');
        return batch.commit();
      }
    })
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
    answer: answer
  }).then(() => {
    return updateListCountByOne(listId, true);
  });
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
  const userDeckRef = `users/${userId}/decks/${deckId}`;

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

  return Promise.all([
    db.doc(deckRef).update({name: deckName}),
    db.doc(userDeckRef).update({name: deckName})
  ]);
}

export function updateCurrentUserList(listId, listName) {
  const userId = firebase.auth().currentUser.uid;
  const listRef = `lists/${listId}`
  const userListRef = `users/${userId}/lists/${listId}`;

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

  return Promise.all([
    db.doc(listRef).update({name: listName}),
    db.doc(userListRef).update({name: listName})
  ]);
}

export function updateCurrentUserProfilePic(file) {
  const uid = firebase.auth().currentUser.uid;
  return storageRef.child(`profilePics/${uid}`).put(file);
}


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

