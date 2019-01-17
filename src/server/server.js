require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const bodyParser = require('body-parser');
const express = require("express");
const app = express();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'corbii-web',
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.dev ? process.env.PRIVATE_KEY : JSON.parse(process.env.PRIVATE_KEY)
  }),
  databaseURL: 'https://corbii-web.firebaseio.com'
});
const db = admin.firestore();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../dist')));

// removes a deck's content documents from the database, then removes the deck
app.post('/api/deletedeck', (req, res) => {
  admin.auth().verifyIdToken(req.body.token).then((decodedToken) => {
    var userId = decodedToken.uid;
    if (req.body.uid != userId) {
      res.sendStatus(403);
    } else {
      const deckId = req.body.deckId;
      const cardsPath = `decks/${deckId}/cards`;
      const deckPath = `decks/${deckId}`;
      Promise.all([
        deleteCollection(cardsPath, 100),
        deleteDocument(deckPath)
      ]).then((results) => {
        res.sendStatus(200);
      }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
    }
  }).catch(function(error) {
    console.log(error);
    res.sendStatus(500);
  });

});

// removes a conceptlist's content documents from the database, then removes the conceptlist
app.post('/api/deletelist', (req, res) => {
  admin.auth().verifyIdToken(req.body.token)
    .then((decodedToken) => {
      var userId = decodedToken.uid;
      if (req.body.uid != userId) {
        res.sendStatus(403);
      } else {
        const listId = req.body.listId;
        const conceptsPath = `lists/${listId}/concepts`;
        
        const listPath = `lists/${listId}`;
        Promise.all([
          deleteCollection(conceptsPath, 100),
          deleteDocument(listPath),
        ]).then((results) => {
          res.sendStatus(200);
        }).catch((err) => {
          console.log(err);
          res.sendStatus(500);
        });
      }
    }).catch(function(error) {
      console.log(error);
      res.sendStatus(500);
    });
});



function deleteDocument(documentPath) {

  return new Promise((resolve, reject) => {
    db.doc(documentPath).delete()
      .then(() => {
        resolve();
      })
      .catch(reject);
  })
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

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});
var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}!`));