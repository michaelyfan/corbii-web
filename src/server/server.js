require('dotenv').config();
const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');
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

const ALGOLIA_ID = process.env.ALGOLIA_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX_1 = 'decks';
const ALGOLIA_INDEX_2 = 'users';
const algoliaClient = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

app.use(express.static("dist"));

app.post('/api/addalgoliauser', (req, res) => {
  const index = algoliaClient.initIndex(ALGOLIA_INDEX_2);
  index.addObject({
    objectID: req.body.uid,
    name: req.body.name,
    photoURL: req.body.photoURL,
    email: req.body.email
  }, function(err, content) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
}); 

app.post('/api/addalgolia', (req, res) => {
  const index = algoliaClient.initIndex(ALGOLIA_INDEX_1);

  index.addObject({
    objectID: req.body.deckId,
    name: req.body.name,
    creatorId: req.body.creatorId,
    creatorName: req.body.creatorName,
    count: req.body.count
  }).then((content) => {
    res.sendStatus(200);
  }).catch((err) => {
    console.log(err);
    res.sendStatus(500);
  }); 

});

app.post('/api/updatealgolia', (req, res) => {
  const index = algoliaClient.initIndex(ALGOLIA_INDEX_1);
  index.partialUpdateObject({
    objectID: req.body.deckId,
    count: req.body.count
  }, function(err, content) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  })
});

app.post('/api/updatealgolianame', (req, res) => {
  const index = algoliaClient.initIndex(ALGOLIA_INDEX_1);
  index.partialUpdateObject({
    objectID: req.body.deckId,
    name: req.body.name
  }, function(err, content) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  })
});

function deletealgolia(deckId) {
  const index = algoliaClient.initIndex(ALGOLIA_INDEX_1);
  index.deleteObject(deckId, function(err, content) {
    if (err) {
      console.log(err);
    }
  });
}

app.post('/api/deletedeck', (req, res) => {

  admin.auth().verifyIdToken(req.body.token)
    .then((decodedToken) => {
      var userId = decodedToken.uid;
      if (req.body.uid != userId) {
        res.sendStatus(403);
      } else {
        const cardsPath = `decks/${req.body.deckId}/cards`;
        const deckPath = `decks/${req.body.deckId}`;
        const userDeckPath = `users/${userId}/decks/${req.body.deckId}`;
        Promise.all([
          deleteCollection(cardsPath, 100),
          deleteDocument(deckPath),
          deleteDocument(userDeckPath)
        ]).then((results) => {
          deletealgolia(req.body.deckId);
          res.sendStatus(200);
        }).catch((err) => {
          res.sendStatus(500);
        });
      }
    }).catch(function(error) {
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