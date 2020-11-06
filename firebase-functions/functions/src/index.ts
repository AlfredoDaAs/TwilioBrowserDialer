import * as functions from 'firebase-functions';
import * as express from 'express';
import * as bodyParser from "body-parser";

import { initializeFirebase } from './firebase'

import authValidation from './auth'

import tokenCrud from './api/token/crud'
import voiceCrud from './api/voice/crud'
import usersCrud from './api/users/crud'

//initialize firebase app
initializeFirebase();

//initialize express server
const app = express();

//For CORS
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Authorization, Accept');
    //req.decoded = { admn: true }

    next();
});

//add the path to receive request and set json as bodyParser to process the body 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/auth', authValidation);

// app.use(apiValidation);

app.use('/token', tokenCrud);
app.use('/voice', voiceCrud);
app.use('/users', usersCrud);

export const api = functions.https.onRequest(app);