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

/**
 * Function to handle period deletion from a classroom. Before executing a period deletion, this
 *   checks if:
 *   1) the client who called this function is the teacher of the period's classroom
 *   2) the period has no students assigned to it.
 *
 * @param  {String} data.classroomId -- the classroomId of the period's classroom
 * @param  {String} data.period -- the desired period to delete
 * @param {String} context.auth.uid -- the Firebase UID of the client who called. Note
 *                                  that context.auth is null if the request was unauthorized.
 *
 * @return {Promise} -- A Promise resolving to the result or an error. Read up on Firebase
 *                      functions to gain a greater understanding of how this result is sent
 *                      back to a client.
 */
exports.deletePeriod = functions.https.onCall((data, context) => {
  const { classroomId, period } = data;
  const teacherId = context.auth ? context.auth.uid : null;

  // check for null params
  if (classroomId == null || period == null || teacherId == null) {
    throw new functions.https.HttpsError('invalid-argument', 'One of the provided arguments is '
      + 'null.');
  }

  // create reference to this classroom and get it
  const classRef = db.collection('classrooms').doc(classroomId);

  return classRef.get().then((classSnap) => {
    if (!classSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Requested classroom does not exist.');
    }

    // throw error if teacher is not this classroom's teacher
    if (classSnap.data().teacherId !== teacherId) {
      throw new functions.https.HttpsError('permission-denied', 'The user does not have permission'
         + ' to perform this operation.');
    }

    // create reference to this classroom's students and get it
    const studentsRef = classRef.collection('users').where('period', '==', period);
    return Promise.all([
      studentsRef.get(),
      classSnap
    ]);
  }).then(([studentsSnap, classSnap]) => {
    // reject if there are students left in this period
    if (studentsSnap.size > 0) {
      throw new functions.https.HttpsError('permission-denied', 'The classroom period still has'
         + ' students; operation denied.');
    }

    // get the periods array and remove the desired period
    const existingPeriods = classSnap.data().periods;
    const indexToRemove = existingPeriods.indexOf(period);
    if (indexToRemove !== -1) {
      existingPeriods.splice(indexToRemove, 1);
    }

    // return an update operation
    return classRef.update({
      periods: existingPeriods
    });
  });
});

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