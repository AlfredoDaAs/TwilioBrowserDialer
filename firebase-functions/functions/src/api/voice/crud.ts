import * as express from 'express'
import * as twilio from 'twilio'

const router = express.Router()

const VoiceResponse = twilio.twiml.VoiceResponse;

// Create TwiML for outbound calls
router.post('/', (request, response) => {
    const voiceResponse = new VoiceResponse();
    console.log('request.body', request.body);
    
    voiceResponse.dial({
        // this will need to update a more dynamic way
        callerId: '+12512377747', //request.body.CallSid,
    }, request.body.number);

    response.type('text/xml');
    response.send(voiceResponse.toString());
});

export default router;