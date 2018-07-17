const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;
const ALGOLIA_INDEX_NAME_1 = 'decks';
const ALGOLIA_INDEX_NAME_2 = 'users';
const ALGOLIA_INDEX_NAME_3 = 'lists;'

const algoliaClient = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

// exports.onDeckCreate = functions.firestore.document('decks/{deckId}').onCreate((snap, context) => {
//   // Get the deck document
//   const deck = snap.data();

//   // Add an 'objectID' field which Algolia requires
//   deck.objectID = context.params.deckId;

//   // Write to the algolia index
//   const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME_1);
//   return index.addObject(deck);
// });

// exports.onDeckUpdate = functions.firestore.document('decks/{deckId}').onUpdate((snap, context) => {
//   const deck = snap.data();
//   deck.objectID = context.params.deckId;
//   return index.saveObject(deck);
// });

// exports.onDeckDelete = functions.firestore.document('decks/{deckId}').onDelete((snap, context) => {
//   const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME_1);
//   return index.deleteObject(context.params.deckId);
// });

// exports.onUserCreate = functions.firestore.document('users/{userId}').onCreate((snap, context) => {
//   const user = snap.data();
//   user.objectID = context.params.userId;
//   const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME_2);
//   return index.addObject(user);
// });

// exports.onUserUpdate = functions.firestore.document('users/{userId}').onUpdate((snap, context) => {
//   const user = snap.data();
//   user.objectID = context.params.userId;
//   return index.saveObject(user);
// });

// exports.onUserDelete = functions.firestore.document('users/{userId}').onDelete((snap, context) => {
//   const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME_2);
//   return index.deleteObject(context.params.userId);
// });

// exports.onListCreate = functions.firestore.document('lists/{listId}').onCreate((snap, context) => {
//   const list = snap.data();
//   list.objectID = context.params.listId;
//   const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME_3);
//   return index.addObject(list);
// });

// exports.onListUpdate = functions.firestore.document('lists/{listId}').onUpdate((snap, context) => {
//   const list = snap.data();
//   list.objectID = context.params.listId;
//   return index.saveObject(list);
// });

// exports.onListDelete = functions.firestore.document('lists/{listId}').onDelete((snap, context) => {
//   const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME_3);
//   return index.deleteObject(context.params.userId);
// });

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});