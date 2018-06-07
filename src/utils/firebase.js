import firebase from 'firebase';

var config =  {
  apiKey: "AIzaSyDPyV2GNIJ92g6cEthuLksRHW8pWqAApeA",
  authDomain: "corbii-web.firebaseapp.com",
  databaseURL: "https://corbii-web.firebaseio.com",
  projectId: "corbii-web",
  storageBucket: "corbii-web.appspot.com",
  messagingSenderId: "843435919174"  
}
firebase.initializeApp(config);

export default firebase;