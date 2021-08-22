import firebase from 'firebase/app';

firebase.initializeApp({
  apiKey: 'AIzaSyDPyV2GNIJ92g6cEthuLksRHW8pWqAApeA',
  authDomain: 'corbii-web.firebaseapp.com',
  databaseURL: 'https://corbii-web.firebaseio.com',
  projectId: 'corbii-web',
  storageBucket: 'corbii-web.appspot.com',
});

export default firebase;