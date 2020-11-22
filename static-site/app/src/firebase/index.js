import firebase from "firebase/app";
//import * as firebaseConfig from './firebase.json'
import "firebase/auth";
import "firebase/database";

let firebaseInstance

// you should add here your firebase configurations from your firebase project
const firebaseConfig = {
    apiKey: process.env.VUE_APP_API_KEY,
    authDomain: process.env.VUE_APP_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_DATABASE_URL,
    projectId: process.env.VUE_APP_PROJECT_ID,
    storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
    appId: process.env.VUE_APP_APP_ID,
    measurementId: process.env.VUE_APP_MEASUREMENT_ID
};

export const isOfflineForDatabase = {
    status: 'offline',
    last_changed: firebase.database.ServerValue.TIMESTAMP,
};

export const isOnlineForDatabase = {
    status: 'online',
    last_changed: firebase.database.ServerValue.TIMESTAMP,
};

export const initRtdbUserStatus = (id) => {
    const userRef = firebase.database().ref(`users/${id}`)
    firebase.database().ref('.info/connected').on('value', function(snapshot) {
        // If we're not currently connected, don't do anything.
        if (snapshot.val() == false) {
            return;
        }
    
        // If we are currently connected, then use the 'onDisconnect()'
        // method to add a set which will only trigger once this
        // client has disconnected by closing the app,
        // losing internet, or any other means.
        userRef.onDisconnect().update(isOfflineForDatabase).then(function() {
            // The promise returned from .onDisconnect().set() will
            // resolve as soon as the server acknowledges the onDisconnect()
            // request, NOT once we've actually disconnected:
            // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
    
            // We can now safely set ourselves as 'online' knowing that the
            // server will mark us as offline once we lose connection.
            userRef.update(isOnlineForDatabase);
        });
    });
}

export const initFirebaseApp = () => {
    if (!firebase.apps.length) {
        firebaseInstance = firebase.initializeApp(firebaseConfig)
    }
    else {
        firebaseInstance = firebase.app()
    }
}

export default firebaseInstance