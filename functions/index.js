const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;
const ALGOLIA_INDEX_NAME_1 = 'decks';
const ALGOLIA_INDEX_NAME_2 = 'users';
const algoliaClient = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

exports.onDeckCreated = functions.firestore.document('decks/{deckId}').onCreate((snap, context) => {
  // Get the deck document
  const deck = snap.data();

  // Add an 'objectID' field which Algolia requires
  deck.objectID = context.params.deckId;

  // Write to the algolia index
  const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME_1);
  return index.saveObject(deck);
});

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});