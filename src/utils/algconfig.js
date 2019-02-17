import algoliasearch from 'algoliasearch';

const id = 'QDG0CXLZ92';
const publicKey = '3e029bef7a3de0ecab02de865ef701f9';
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

export default {
  deckIndex,
  userIndex,
  listIndex,
  algClient
};