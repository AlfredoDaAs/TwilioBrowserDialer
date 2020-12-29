import * as functions from 'firebase-functions';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as cors from 'cors'

import { initializeFirebase } from './firebase'

import authValidation from './auth'
import { apiValidation } from './api'

// twilio api modules
import tokenCrud from './api/twilio/token'
import voiceCrud from './api/twilio/voice'
import numbersCrud from './api/twilio/numbers'
import taskRouter from './api/twilio/taskRouter'

import usersCrud from './api/users/crud'
import deparmentsCrud from './api/deparments/crud'
import callsCrud from './api/calls/crud'
import contactsCrud from './api/contacts/crud'

//initialize firebase app
initializeFirebase();

//initialize express server
const app = express();

app.use(cors({ origin: true }))
//add the path to receive request and set json as bodyParser to process the body 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/auth', authValidation);

// twilio endpoints
app.use('/voice', voiceCrud);

// from here down app is protected by token
app.use(apiValidation);
app.use('/token', tokenCrud);
app.use('/users', usersCrud);
app.use('/numbers', numbersCrud);
app.use('/departments', deparmentsCrud);
app.use('/calls', callsCrud);
app.use('/taskRouter', taskRouter);
app.use('/contacts', contactsCrud);

app.use(function(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.error(err.stack);
    res.status(500).send({ error: err.message });
});

export const api = functions.https.onRequest(app);