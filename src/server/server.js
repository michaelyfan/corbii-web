require('dotenv').config();
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const express = require("express");
const app = express();
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'corbii-web',
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY
  }),
  databaseURL: 'https://corbii-web.firebaseio.com'
});
const db = admin.firestore();

app.use(express.static("dist"));
 
app.post('/api/deletedeck', (req, res) => {
  const cardsPath = `decks/${req.body.deckId}/cards`;
  const deckPath = `decks/${req.body.deckId}`;
  const userDeckPath = `users/${req.body.userId}/decks/${req.body.deckId}`;

  Promise.all([
    deleteCollection(cardsPath, 100),
    deleteDocument(deckPath),
    deleteDocument(userDeckPath)
  ]).then((results) => {
    res.sendStatus(200);
  }).catch((err) => {
    res.sendStatus(500);
  });
});

app.listen(3000, () => console.log("Listening on port 3000!"));

function deleteDocument(documentPath) {

  return new Promise((resolve, reject) => {
    db.doc(documentPath).delete()
      .then(() => {
        resolve();
      })
      .catch(reject);
  })
}

function deleteCollection(collectionPath, batchSize) {
  var collectionRef = db.collection(collectionPath);
  var query = collectionRef.orderBy('__name__').limit(batchSize);

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