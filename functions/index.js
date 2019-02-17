const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;
const ALGOLIAINDEX1 = functions.config().algolia.deck_index;
const ALGOLIAINDEX2 = functions.config().algolia.user_index;
const ALGOLIAINDEX3 = functions.config().algolia.list_index;

const algoliaClient = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY); 

function deleteDocument(documentPath) {
  return new Promise((resolve, reject) => {
    db.doc(documentPath).delete()
      .then(() => {
        resolve();
      })
      .catch(reject);
  });
}

function deleteCollection(collectionPath, batchSize, collectionRef) {
  let colRef;
  if (collectionRef) {
    colRef = collectionRef;
  } else {
    colRef = db.collection(collectionPath);
  }
  let query = colRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, batchSize, resolve, reject);
  });
}

function deleteQueryBatch(query, batchSize, resolve, reject) {
  query.get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size == 0) {
        return 0;
      }

      // Delete documents in a batch
      var batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        return snapshot.size;
      });
    }).then((numDeleted) => {
      if (numDeleted === 0) {
        resolve();
        return;
      }

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(query, batchSize, resolve, reject);
      });
    })
    .catch(reject);
}

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

exports.onDeckUpdate = functions.firestore.document('decks/{deckId}').onUpdate((snap, context) => {
  const deck = snap.data();
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
  const index = algoliaClient.initIndex(ALGOLIAINDEX1);
  return index.deleteObject(deckId);
});

exports.onUserCreate = functions.firestore.document('users/{userId}').onCreate((snap, context) => {
  const user = snap.data();
  user.objectID = context.params.userId;
  const index = algoliaClient.initIndex(ALGOLIAINDEX2);
  return index.addObject(user);
});

exports.onUserUpdate = functions.firestore.document('users/{userId}').onUpdate((snap, context) => {
  const user = snap.data();
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

exports.onListUpdate = functions.firestore.document('lists/{listId}').onUpdate((snap, context) => {
  const list = snap.data();
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
  const index = algoliaClient.initIndex(ALGOLIAINDEX3);
  return index.deleteObject(listId);
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