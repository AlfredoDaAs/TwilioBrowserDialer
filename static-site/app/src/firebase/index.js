import firebase from "firebase/app";
//import * as firebaseConfig from './firebase.json'
import "firebase/auth";
import "firebase/database";

let firebaseInstance

const firebaseConfig = {
    apiKey: "AIzaSyBsBC86B_jaYoZaTYq3Ox7P_000wnDBLHg",
    authDomain: "twiliobrowserdialer.firebaseapp.com",
    databaseURL: "https://twiliobrowserdialer.firebaseio.com",
    projectId: "twiliobrowserdialer",
    storageBucket: "twiliobrowserdialer.appspot.com",
    messagingSenderId: "1016261872570",
    appId: "1:1016261872570:web:d62d4c963aba1b362f6b83",
    measurementId: "G-Q13CDVRWQE"
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