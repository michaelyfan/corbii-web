require('dotenv').config();
const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');
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

const ALGOLIA_ID = process.env.ALGOLIA_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX_1 = 'decks';
const ALGOLIA_INDEX_2 = 'users';
const ALGOLIA_INDEX_3 = 'lists';
const algoliaClient = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../dist')));

app.post('/api/addalgolia', (req, res) => {
  const type = req.body.type;
  const object = req.body.object;

  if (type == null) {
    res.status(400).send({
      message: 'A type must be specified.'
    })
  } else if (object == null){
    res.status(400).send({
      message: 'An object must be specified.'
    })
  } else if (object.objectID == null) {
    res.status(400).send({
      message: 'An object with an objectID must be specified.'
    })
  } else if (type != 'decks' && type !='users' && type != 'lists') {
    res.status(400).send({
      message: 'Invalid type.'
    })
  }

  const index = algoliaClient.initIndex(type);
  index.addObject(object, (err, content) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

app.post('/api/updatealgolia', (req, res) => {
  const type = req.body.type;
  const object = req.body.object;

  if (type == null) {
    res.status(400).send({
      message: 'A type must be specified.'
    })
  } else if (object == null){
    res.status(400).send({
      message: 'An object must be specified.'
    })
  } else if (object.objectID == null) {
    res.status(400).send({
      message: 'An object with an objectID must be specified.'
    })
  } else if (type != 'decks' && type !='users' && type != 'lists') {
    res.status(400).send({
      message: 'Invalid type.'
    })
  }

  const index = algoliaClient.initIndex(type);
  index.partialUpdateObject(object, function(err, content) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  })
})

function deletealgolia(type, objectID) {
  if (type == null) {
    res.status(400).send({
      message: 'A type must be specified.'
    })
  } else if (objectID == null){
    res.status(400).send({
      message: 'An objectID must be specified.'
    })
  } else if (type != 'decks' && type !='users' && type != 'lists') {
    res.status(400).send({
      message: 'Invalid type.'
    })
  }

  const index = algoliaClient.initIndex(type);
  index.deleteObject(objectID, function(err, content) {
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
        const deckId = req.body.deckId;
        const cardsPath = `decks/${deckId}/cards`;
        const deckPath = `decks/${deckId}`;
        const cardsDataRef = db.collection('spacedRepData').where('deckId', '==', deckId);
        Promise.all([
          deleteCollection(cardsPath, 100),
          deleteCollection(cardsDataRef, 100, cardsDataRef),
          deleteDocument(deckPath)
        ]).then((results) => {
          deletealgolia('decks', deckId);
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

app.post('/api/deletelist', (req, res) => {
  admin.auth().verifyIdToken(req.body.token)
    .then((decodedToken) => {
      var userId = decodedToken.uid;
      if (req.body.uid != userId) {
        res.sendStatus(403);
      } else {
        const listId = req.body.listId;
        const conceptsPath = `lists/${listId}/concepts`;
        const conceptsDataRef = db.collection('selfExData').where('listId', '==', listId);
        const listPath = `lists/${listId}`;
        Promise.all([
          deleteCollection(conceptsPath, 100),
          deleteCollection(conceptsDataRef, 100, conceptsDataRef),
          deleteDocument(listPath),
        ]).then((results) => {
          deletealgolia('lists', listId);
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
  var colRef;
  if (collectionRef) {
    colRef = collectionRef;
  } else {
    colRef = db.collection(collectionPath);
  }
  var query = colRef.orderBy('__name__').limit(batchSize);

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