import firebase from 'firebase';

let config;
if (process.env.NODE_ENV === 'production') {
  config =  {
    apiKey: 'AIzaSyDPyV2GNIJ92g6cEthuLksRHW8pWqAApeA',
    authDomain: 'corbii-web.firebaseapp.com',
    databaseURL: 'https://corbii-web.firebaseio.com',
    projectId: 'corbii-web',
    storageBucket: 'corbii-web.appspot.com',
  };
} else {
  config = {
    apiKey: 'AIzaSyDRE4PF37C_8ceo8xWkKlSp2voJgmvfjws',
    authDomain: 'corbii-web-dev.firebaseapp.com',
    databaseURL: 'https://corbii-web-dev.firebaseio.com',
    projectId: 'corbii-web-dev',
    storageBucket: 'corbii-web-dev.appspot.com',
  };
}

firebase.initializeApp(config);

export default firebase;