import * as express from 'express'
import * as functions from 'firebase-functions';
import * as twilio from 'twilio'
import calls from '../../firestore/calls'

const router = express.Router()

const VoiceResponse = twilio.twiml.VoiceResponse;

const validateTwilioRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const twilioSignature = req.headers['x-twilio-signature']
  const params = req.body
  const url: String = functions.config().twilio.voiceurl // post endpoint
  
  if (typeof twilioSignature === 'string') {
    const requestIsValid = twilio.validateRequest(
      functions.config().twilio.authtoken,
      twilioSignature,
      `${url}${req.path}${req.path === '/inbound' ? `?clientName=${req.query.clientName}` : ''}`,
      params
    )

    if (requestIsValid) {
      next()
      return;
    }
  }

  res.sendStatus(403)
  return;
}

// Create TwiML for outbound calls
router.post('/outbound', validateTwilioRequest, async (req: express.Request, res: express.Response) => {
  const voiceResponse = new VoiceResponse();

  await calls.createOne({
    fromData: {
      from: req.body.callerId
    },
    toData: {
      to: req.body.To
    },
    callSid:  req.body.CallSid,
    direction: 'outbound'
  })
  
  voiceResponse.dial({
    callerId: req.body.callerId
  }, req.body.To);

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

router.post('/inbound', validateTwilioRequest, async (req: express.Request, res: express.Response) => {
  const result = await calls.createOne({
    fromData: {
      from: req.body.From,
      city: req.body.FromCity,
      country: req.body.FromCountry,
      state: req.body.FromState,
      zip: req.body.FromZip
    },
    toData: {
      to: req.body.To,
      city: req.body.ToCity,
      country: req.body.ToCountry,
      state: req.body.ToState,
      zip: req.body.ToZip
    },
    callSid:  req.body.CallSid,
    direction: 'inbound'
  })

  const clientName = req.query.clientName as string
  const voiceResponse = new VoiceResponse();
  const dial = voiceResponse.dial();
  const client = dial.client(clientName)

  client.parameter({
    name: 'callId',
    value: result
  })

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

export default router;