import * as express from 'express'
import * as functions from 'firebase-functions';
import * as twilio from 'twilio'
import users from '../../firestore/users'

const router = express.Router()

const ClientCapability = twilio.jwt.ClientCapability

// Generate a Twilio Client capability token
router.get('/', async (request, response, next) => {
  const user = await users.readOne(request.body.id);

  if(user) {
    const capability = new ClientCapability({
      accountSid: functions.config().twilio.accountsid,
      authToken: functions.config().twilio.authtoken,
      ttl: 120
    })
  
    capability.addScope(new ClientCapability.IncomingClientScope(`${user.name}_${user.lastName}`))
    capability.addScope(
      new ClientCapability.OutgoingClientScope({
        applicationSid: functions.config().twilio.applicationsid
      })
    );
  
    const token = capability.toJwt();
  
    // Include token in a JSON response
    response.send({
      token: token
    });
  } else {
    next(new Error('User not found'));
  }
});

export default router;