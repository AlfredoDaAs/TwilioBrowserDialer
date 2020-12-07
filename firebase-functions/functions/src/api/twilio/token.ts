import * as express from 'express'
import * as functions from 'firebase-functions';
import * as twilio from 'twilio'
import users from '../../firestore/users'

const router = express.Router()

const ClientCapability = twilio.jwt.ClientCapability

// Generate a Twilio Client capability token
router.get('/:id', async (request, response, next) => {
  const user = await users.readOne(request.params.id);

  if(user) {
    const capability = new ClientCapability({
      accountSid: functions.config().twilio.accountsid,
      authToken: functions.config().twilio.authtoken,
      ttl: 28800 // token will live for 8 work hours
    });

    capability.addScope(new ClientCapability.IncomingClientScope(user.id));
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