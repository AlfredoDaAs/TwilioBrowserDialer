import * as express from 'express'
import * as twilio from 'twilio'

const router = express.Router()

const ClientCapability = twilio.jwt.ClientCapability;

// Generate a Twilio Client capability token
router.get('/', (request, response) => {
    const capability = new ClientCapability({
        accountSid: 'ACca276a290b202121eb6b83d9db6cec31',
        authToken: '2e792a90ccd066261a59c8ad23c3e03c',
        ttl: 120
    })

    capability.addScope(
        new ClientCapability.OutgoingClientScope({
            applicationSid: 'AP0f54cc6d5c8bb27db4eff1292b4f40c5'
        })
    );

    const token = capability.toJwt();

    // Include token in a JSON response
    response.send({
        token: token
    });
});

export default router;