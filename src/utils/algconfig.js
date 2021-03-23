import algoliasearch from 'algoliasearch';

const id = 'KBFC8I3K1R';
const publicKey = 'd194e4f980bb066f4acd86526bd22cbd';
const deckIndex = 'decks';
const userIndex = 'users';

const algClient = algoliasearch(id, publicKey);

export {
  deckIndex,
  userIndex,
  algClient
};