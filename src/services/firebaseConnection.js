import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';

let firebaseConfig = {
  apiKey: 'AIzaSyANsGJx6k5AffauEzXRdzqRqVjUep_JoPM',
  authDomain: 'tasks-4227d.firebaseapp.com',
  projectId: 'tasks-4227d',
  storageBucket: 'tasks-4227d.appspot.com',
  messagingSenderId: '642835045898',
  appId: '1:642835045898:web:67050415d2806ab2d9c9f3',
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
