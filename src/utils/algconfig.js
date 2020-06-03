import algoliasearch from 'algoliasearch';

const id = 'PE6JJWU79O';
const publicKey = 'fa463270b72eea28d9e00a818f67ffda';
let deckIndex;
let userIndex;

if (process.env.NODE_ENV === 'production') {
  deckIndex = 'decks';
  userIndex = 'users';
} else {
  deckIndex = 'dev_decks';
  userIndex = 'dev_users';
}

const algClient = algoliasearch(id, publicKey);

export {
  deckIndex,
  userIndex,
  algClient
};