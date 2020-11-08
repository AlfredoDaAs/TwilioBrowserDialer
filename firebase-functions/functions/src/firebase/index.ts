import * as functions from 'firebase-functions';
import * as admin from "firebase-admin"
import { initializeEnvironment } from '../common/env'

const firebaseInstance = admin.initializeApp(functions.config().firebase)
let db: FirebaseFirestore.Firestore

export const firebase = () => {
    return firebaseInstance
}

export const firestore = () => {
    return db
}

export const initializeFirebase = () => {
    if(!db) {
        initializeEnvironment(functions.config())
        db = firebaseInstance.firestore()

        db.settings({
            timestampsInSnapshots: true
        })
    }

    return {
        firebase: firebaseInstance,
        firestore: db
    }
}