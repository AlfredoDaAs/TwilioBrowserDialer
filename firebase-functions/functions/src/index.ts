import * as functions from 'firebase-functions';
import * as express from 'express';
import * as bodyParser from "body-parser";

//initialize express server
const app = express();

//add the path to receive request and set json as bodyParser to process the body 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

export const api = functions.https.onRequest(app);