import algoliasearch from 'algoliasearch';

const id = 'PE6JJWU79O';
const publicKey = 'fa463270b72eea28d9e00a818f67ffda';
let deckIndex;
let userIndex;
let listIndex;

if (process.env.NODE_ENV === 'production') {
  deckIndex = 'decks';
  userIndex = 'users';
  listIndex = 'lists';
} else {
  deckIndex = 'dev_decks';
  userIndex = 'dev_users';
  listIndex = 'dev_lists';
}

const algClient = algoliasearch(id, publicKey);

export {
  deckIndex,
  userIndex,
  listIndex,
  algClient
};