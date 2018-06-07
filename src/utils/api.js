import firebase from './firebase';
import 'firebase/firestore';

// tool initializations
const db = firebase.firestore();

// For suppressing a console error
const settings = {timestampsInSnapshots: true};
db.settings(settings);

export function addUser(uid, name, callbackFailure) {
  db.collection('users').doc(uid).set({
    name: name,
  }).then(() => {
    console.log("User document written with ID: ", uid);
  }).catch((error) => {
    console.error(error);
    callbackFailure();
  });
}

export function addDeck(deckName, userId, callbackSuccess, callbackFailure) {
  db.collection('decks').add({
    name: deckName,
  }).then((docRef) => {
    console.log('Deck document written with ID: ', docRef.id);
    db.collection('users').doc(userId).collection('decks').doc(docRef.id).set({
      name: deckName
    }).then(() => {
      console.log('Deck within users document successfully committed!');
      callbackSuccess();
    }).catch((err) => {
      console.error(err);
      callbackFailure();
    });
  }).catch((err) => {
    console.error(err);
    callbackFailure();
  })
}

export function addCard(front, back, deckId, callbackSuccess, callbackFailure) {
  db.collection('decks').doc(deckId).collection('cards').add({
    front: front,
    back: back, 
    internal: 0
  }).then((docRef) => {
    console.log("Card subdoc written with ID: ", docRef.id);
    callbackSuccess();
  }).catch((error) => {
    console.error(error);
    callbackFailure();
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

  db.collection('users').doc(userId).collection('decks').get()
    .then((querySnapshot) => {
      let decksArr = [];
      querySnapshot.forEach((deck) => {
        decksArr.push({
          id: deck.id,
          name: deck.data().name
        });
      });
      callbackSuccess(decksArr);
    }).catch((err) => {
      console.log('Error getting documents', err);
      callbackFailure();
    })
}

export function deleteCard(deckId, cardId) {

  db.collection('decks').doc(deckId).collection('cards').doc(cardId).delete()
    .catch((err) => {
      console.log('Error deleting documents', err);
    });

}

export function deleteDeck(userId, deckId, callback) {
  const data = {
    userId: userId,
    deckId: deckId
  }

  fetch('/api/deletedeck', {
    method: 'POST',
    body: JSON.stringify(data),
    headers:{
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      callback();
    }).catch((err) => {console.log(err)})
}

export function updateDeck(userId, deckId, deckName, callback) {
  const deckRef = `decks/${deckId}`
  const userDeckRef = `users/${userId}/decks/${deckId}`;

  Promise.all([
    db.doc(deckRef).update({name: deckName}),
    db.doc(userDeckRef).update({name: deckName})
  ]).then(() => {
    callback();
  })

}