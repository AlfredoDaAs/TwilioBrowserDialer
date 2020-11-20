import * as functions from 'firebase-functions';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as cors from 'cors'

import { initializeFirebase } from './firebase'

import authValidation from './auth'
import { apiValidation } from './api'

import tokenCrud from './api/token/crud'
import voiceCrud from './api/voice/crud'
import usersCrud from './api/users/crud'

//initialize firebase app
initializeFirebase();

//initialize express server
const app = express();

app.use(cors({ origin: true }))
//add the path to receive request and set json as bodyParser to process the body 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/auth', authValidation);

// twilio TwiML voice endpoint
app.use('/voice', voiceCrud);

// from here down app is protected by token
app.use(apiValidation);
app.use('/token', tokenCrud);
app.use('/users', usersCrud);

app.use(function(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.error(err.stack);
    res.status(500).send({ error: err.message });
});

export const api = functions.https.onRequest(app);