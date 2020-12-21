import * as express from 'express';
import * as functions from 'firebase-functions';
import * as twilio from 'twilio';
import users from '../../firestore/users';

const router = express.Router();

const accountSid = functions.config().twilio.accountsid;
const authToken = functions.config().twilio.authtoken;

const client = twilio(accountSid, authToken);

router.get('/search', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { areaCode, state } = req.query;
    const filter:any = {
      limit: 20
    };

    if(areaCode) filter.areaCode = Number(areaCode);
    if(state) filter.inRegion = state;
    
    const availablePhoneNumbers = await client.availablePhoneNumbers('US').local.list(filter);

    res.json(availablePhoneNumbers)
  } catch (error) {
    next(error)
  }
});

router.post('/provision', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const voiceUrl = `${functions.config().twilio.voiceurl}/inbound?clientName=${req.decoded.id}`
    const incomingPhoneNumber = await client.incomingPhoneNumbers.create({ phoneNumber: req.body.phoneNumber, voiceUrl })
    const result = await users.updateOne(req.decoded.id, {
      phoneNumber: incomingPhoneNumber.phoneNumber
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
});

export default router;
