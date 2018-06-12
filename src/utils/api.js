import firebase from './firebase';
import 'firebase/firestore';
import alg from './algconfig';
import algoliasearch from 'algoliasearch';

// tool initializations
const db = firebase.firestore();
const client = algoliasearch(alg.id, alg.key);

// variable declarations
const ALGOLIA_INDEX_NAME_1 = 'decks';
const ALGOLIA_INDEX_NAME_2 = 'users';

// For suppressing a console error
const settings = {timestampsInSnapshots: true};
db.settings(settings);

export function addUser(uid, name) {
  return db.collection('users').doc(uid).set({
    name: name,
  });
}

export function addDeck(deckName, userId, userName) {
  
  const data = {
    name: deckName,
    creatorId: userId,
    creatorName: userName,
    count: 0
  }

  return db.collection('decks').add(data).then((docRef) => {

    data.deckId = docRef.id;

    // very temporary algolia index solution
    fetch('/api/addalgolia', {
      method: 'POST',
      body: JSON.stringify(data),
      headers:{
        'Content-Type': 'application/json'
      }
    });

    return db.collection('users').doc(userId).collection('decks').doc(docRef.id).set({
      name: deckName
    });
  });
}

export function addCard(front, back, deckId) {
  const deckRef = db.collection('decks').doc(deckId);
  return deckRef.collection('cards').add({
    front: front,
    back: back,
    internal: 0
  }).then(() => {
    return db.runTransaction((t) => {
      return t.get(deckRef).then((res) => {
        if (!res.exists) {
          throw new Error('deck does not exist.');
        }

        let newCount = res.data().count + 1;
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
  });
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
    cards: cardsArr
  }

}

export function getDecks(userId, callbackSuccess, callbackFailure) {
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

export function deleteCard(deckId, cardId) {
  const deckRef = db.collection('decks').doc(deckId);
  return deckRef.collection('cards').doc(cardId).delete().then(() => {
    return db.runTransaction((t) => {
      return t.get(deckRef).then((res) => {
        if (!res.exists) {
          throw new Error('deck does not exist.');
        }

        let newCount = res.data().count - 1;
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
  });

}

export function deleteDeck(userId, deckId) {
  const data = {
    userId: userId,
    deckId: deckId
  }



  return fetch('/api/deletedeck', {
    method: 'POST',
    body: JSON.stringify(data),
    headers:{
      'Content-Type': 'application/json'
    }
  });
}

export function updateDeck(userId, deckId, deckName) {
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

export function updateCard(deckId, cardId, front, back) {
  const cardRef = `decks/${deckId}/cards/${cardId}`;

  return db.doc(cardRef).update({
    front: front,
    back: back
  });
}

export function searchDecks(query) {
  return new Promise((resolve, reject) => {
    const index = client.initIndex('decks');
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