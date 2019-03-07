const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');
const { deleteCollection } = require('./utils');
const db = require('./init');

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;
const ALGOLIAINDEX1 = functions.config().algolia.deck_index;
const ALGOLIAINDEX2 = functions.config().algolia.user_index;
const ALGOLIAINDEX3 = functions.config().algolia.list_index;

const algoliaClient = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

exports.onDeckCreate = functions.firestore.document('decks/{deckId}').onCreate((snap, context) => {
  // Get the deck document
  const deck = snap.data();

  if (deck.isClassroomPrivate) {
    return Promise.resolve();
  } else {
    // Add an 'objectID' field which Algolia requires
    deck.objectID = context.params.deckId;

    // Write to the algolia index
    const index = algoliaClient.initIndex(ALGOLIAINDEX1);
    return index.addObject(deck);
  }
});

exports.onDeckUpdate = functions.firestore.document('decks/{deckId}').onUpdate((change, context) => {
  const deck = change.after.data();
  if (deck.isClassroomPrivate) {
    return Promise.resolve();
  } else {
    deck.objectID = context.params.deckId;
    const index = algoliaClient.initIndex(ALGOLIAINDEX1);
    return index.saveObject(deck);  
  }
  
});

exports.onDeckDelete = functions.firestore.document('decks/{deckId}').onDelete((snap, context) => {
  const deckId = context.params.deckId;
  const cardsPath = `decks/${deckId}/cards`;
  const index = algoliaClient.initIndex(ALGOLIAINDEX1);
  return Promise.all([
    index.deleteObject(deckId),
    deleteCollection(cardsPath, 100)
  ]);
});

exports.onUserCreate = functions.firestore.document('users/{userId}').onCreate((snap, context) => {
  const user = snap.data();
  user.objectID = context.params.userId;
  const index = algoliaClient.initIndex(ALGOLIAINDEX2);
  return index.addObject(user);
});

exports.onUserUpdate = functions.firestore.document('users/{userId}').onUpdate((change, context) => {
  const user = change.after.data();
  user.objectID = context.params.userId;
  const index = algoliaClient.initIndex(ALGOLIAINDEX2);
  return index.saveObject(user);
});

exports.onUserDelete = functions.firestore.document('users/{userId}').onDelete((snap, context) => {
  const index = algoliaClient.initIndex(ALGOLIAINDEX2);
  return index.deleteObject(context.params.userId);
});

exports.onListCreate = functions.firestore.document('lists/{listId}').onCreate((snap, context) => {
  const list = snap.data();
  if (list.isClassroomPrivate) {
    return Promise.resolve();
  } else {
    list.objectID = context.params.listId;
    const index = algoliaClient.initIndex(ALGOLIAINDEX3);
    return index.addObject(list);
  }
});

exports.onListUpdate = functions.firestore.document('lists/{listId}').onUpdate((change, context) => {
  const list = change.after.data();
  if (list.isClassroomPrivate) {
    return Promise.resolve();
  } else {
    list.objectID = context.params.listId;
    const index = algoliaClient.initIndex(ALGOLIAINDEX3);
    return index.saveObject(list);
  }
});

exports.onListDelete = functions.firestore.document('lists/{listId}').onDelete((snap, context) => {
  const listId = context.params.listId;
  const conceptsPath = `lists/${listId}/concepts`;
  const index = algoliaClient.initIndex(ALGOLIAINDEX3);
  return Promise.all([
    deleteCollection(conceptsPath, 100),
    index.deleteObject(listId)
  ]);
});

exports.onCardDelete = functions.firestore.document('decks/{deckId}/cards/{cardId}').onDelete((snap, context) => {
  const cardId = context.params.cardId;
  const cardDataRef = db.collection('spacedRepData').where('cardId', '==', cardId);
  return deleteCollection(cardDataRef, 100, cardDataRef);
});

exports.onConceptDelete = functions.firestore.document('lists/{listId}/concepts/{conceptId}').onDelete((snap, context) => {
  const conceptId = context.params.conceptId;
  const conceptDataRef = db.collection('selfExData').where('conceptId', '==', conceptId);
  return deleteCollection(conceptDataRef, 100, conceptDataRef);
});

// triggered by classroom student doc deletion
exports.onStudentDelete = functions.firestore.document('classrooms/{classroomId}/users/{userId}').onDelete((snap, context) => {
  // get IDs from context
  const { classroomId, userId } = context.params;

  // generate reference to all this student's study points in this classroom
  const dataRef = db.collection('classSpacedRepData')
    .where('classroomId', '==', classroomId)
    .where('userId', '==', userId);

  // generate reference to this student's record of the classroom
  const userRef = db.collection('users').doc(userId);

  // 1) delete user's reference to the classroom
  // 2) delete all class spaced rep data of this user in the classroom
  return Promise.all([
    db.runTransaction((trans) => {
      return trans.get(userRef).then((userDoc) => {
        if (!userDoc.exists) {
          throw 'Encountered nonexistant user doc, aborting...';
        }

        const existingClassrooms = userDoc.data().classrooms;
        const offendingIndex = existingClassrooms.indexOf(classroomId);
        if (offendingIndex >= 0) {
          existingClassrooms.splice(offendingIndex, 1);
        }
        trans.update(userRef, { classrooms: existingClassrooms });
      });
    }),
    deleteCollection(null, null, dataRef)
  ]);
});