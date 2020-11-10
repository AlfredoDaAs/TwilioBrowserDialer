import * as express from 'express'
import * as functions from 'firebase-functions';
import * as twilio from 'twilio'

const router = express.Router()

const ClientCapability = twilio.jwt.ClientCapability;

// Generate a Twilio Client capability token
router.get('/', (request, response) => {
    const capability = new ClientCapability({
        accountSid: functions.config().twilio.accountsid,
        authToken: functions.config().twilio.authtoken,
        ttl: 120
    })

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
});

export default router;