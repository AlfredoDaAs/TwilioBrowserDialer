import * as express from 'express'
import * as functions from 'firebase-functions';
import * as twilio from 'twilio'

const router = express.Router()

const VoiceResponse = twilio.twiml.VoiceResponse;

const validateTwilioRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const twilioSignature = req.headers['x-twilio-signature']
    const params = req.body
    const url = functions.config().twilio.voiceurl // post endpoint

    if(typeof twilioSignature === 'string') {
        const requestIsValid = twilio.validateRequest(
            functions.config().twilio.authtoken,
            twilioSignature,
            url,
            params
        )

        if(requestIsValid) {
            next()
            return;
        }
    }

    res.sendStatus(403)
    return;
}

// Create TwiML for outbound calls
router.post('/', validateTwilioRequest, (request, response) => {
    const voiceResponse = new VoiceResponse();
    
    voiceResponse.dial({
        // this will need to update a more dynamic way
        callerId: functions.config().twilio.phonenumber
    }, request.body.number);

    response.type('text/xml');
    response.send(voiceResponse.toString());
});

export default router;