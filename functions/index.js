const { functions, db, algoliaClient } = require('./init');
const { deleteCollection } = require('./utils');

const ALGOLIAINDEX1 = functions.config().algolia.deck_index;
const ALGOLIAINDEX2 = functions.config().algolia.user_index;

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

exports.onCardDelete = functions.firestore.document('decks/{deckId}/cards/{cardId}').onDelete((snap, context) => {
  const cardId = context.params.cardId;
  const cardDataRef = db.collection('spacedRepData').where('cardId', '==', cardId);
  return deleteCollection(cardDataRef, 100, cardDataRef);
});
