import firebase from './firebase';
import 'firebase/firestore';
import { deckIndex, userIndex, algClient } from './algconfig';
import { smAlgorithm } from './algorithms';
import moment from 'moment';
import imageCompression from 'browser-image-compression';

// tool initializations
const db = firebase.firestore();
const storage = firebase.storage();
const storageRef = storage.ref();

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
 * Gets the contents of a deck.
 *
 * @param {String} deckId -- the ID of the desired deck.
 *
 * @return a Promise that resolves with an object containing the deck's content. The
 *    object's attributes are deckName (the deck's name), creatorId (the ID of the
 *    deck's creator), and cards (an array of card objects). A card object's attributes
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
  return db.collection('decks')
    .where('creatorId', '==', uid)
    .get().then((querySnapshot) => {
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

export function getUserAll(uid) {
  // get user profile info first to allow error to catch if this user doesn't exist
  return getUserProfileInfo(uid).then((res) => {
    return Promise.all([
      res,
      getUserDecks(uid),
    ]);
  }).then((results) => {
    const [ user, decks ] = results;
    return {
      name: user.data().name,
      email: user.data().email,
      id: user.id,
      decks: decks,
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

export function getCurrentUserProfilePic() {
  const uid = firebase.auth().currentUser.uid;
  return getProfilePic(uid);
}

export function getCurrentUserProfileInfo() {
  const uid = firebase.auth().currentUser.uid;
  return getUserProfileInfo(uid);
}

export function getUserOnLogin() {
  const uid = firebase.auth().currentUser.uid;
  const userRef = db.collection('users').doc(uid);
  return userRef.get().then((userDocSnapshot) => {
    if (userDocSnapshot.exists) {
      return {
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

export function createNewDbUser() {
  const { displayName, email, uid } = firebase.auth().currentUser;

  return Promise.all([
    db.collection('users').doc(uid).set({
      name: displayName,
      email: email,
    }),
    fetch('https://i.imgur.com/nYDMVCK.jpg')
  ]).then((res) => res[1].blob()).then((res) => {
    return updateCurrentUserProfilePic(res);
  });
}

export function createDeckCurrentUser(params) {
  const { deckName, cards } = params;
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
    count: (cards && cards.length) || 0,
  };

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

    });
  });
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

/**
 * Updates the profile picture of a user. The file will be compressed before being sent to Firebase
 *   Storage for storage.
 * @param  {File} file The file, of type image, to make as the profile picture.
 * @return {Promise}      A Promise with the result of the Firebase call.
 */
export function updateCurrentUserProfilePic(file) {
  const uid = firebase.auth().currentUser.uid;
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    maxIteration: 10
  };
  return imageCompression(file, options).then((compressedFile) => {
    return storageRef.child(`profilePics/${uid}`).put(compressedFile);
  });
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

export function deleteDeckFromCurrentUser(deckId) {
  const deckRef = db.collection('decks').doc(deckId);
  return deckRef.delete();
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

// end search functions

// begin auth functions

/**
 * Sends the currently logged-in user's email a link to reset their password. 
 * @return {Promise} A Promise returning the result of the Firebase call or error. Will error if
 *                     there is no currently logged-in user.
 */
export function sendPasswordResetEmail() {
  const auth = firebase.auth();
  const { currentUser } = auth;
  if (currentUser == null) {
    return Promise.reject(new Error('No user currently logged in -- aborting!'));
  }

  const email = currentUser.email;
  return auth.sendPasswordResetEmail(email);
}

// end auth functions

/* eslint-disable-next-line */
async function main() {

  // sendPasswordResetEmail();
}

// main();