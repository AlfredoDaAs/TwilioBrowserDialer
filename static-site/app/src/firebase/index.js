import firebase from "firebase/app";
//import * as firebaseConfig from './firebase.json'
import "firebase/auth";

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
  
export const initFirebaseApp = () => {
    if(!firebase.apps.length) {
        firebaseInstance = firebase.initializeApp(firebaseConfig)
    }
    else {
        firebaseInstance = firebase.app()
    }
}

export default firebaseInstance