import * as express from 'express'
import * as functions from 'firebase-functions';
import * as twilio from 'twilio'
import * as querystring from 'querystring'
import * as util from 'util'
import calls from '../../firestore/calls'
import departments from '../../firestore/departments'

const router = express.Router()

const VoiceResponse = twilio.twiml.VoiceResponse;

const accountSid: string = functions.config().twilio.accountsid;
const authToken: string = functions.config().twilio.authtoken;
const url: string = functions.config().twilio.voiceurl
const workspaceSid: string = functions.config().twilio.workspace_sid;
const { idle } = functions.config().twilio.workspace_activities;

const twilioClient = twilio(accountSid, authToken); 

const workspace = twilioClient.taskrouter.v1.workspaces(workspaceSid);

const validateTwilioRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const twilioSignature = req.headers['x-twilio-signature']
  const params = req.body
  
  if (typeof twilioSignature === 'string') {
    const requestIsValid = twilio.validateRequest(
      functions.config().twilio.authtoken,
      twilioSignature,
      `${url}${req.path}${req.path === '/incoming' ? `?clientName=${req.query.clientName}` : ''}`,
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



router.post('/incoming', validateTwilioRequest, async (req: express.Request, res: express.Response) => {
  const voiceResponse = new VoiceResponse();
  // const clientName = req.query.clientName as string

  const result = await departments.getDeparments();
  let say = ''

  if(result.length > 0) {
    for (const key in result) {
      say += `For ${result[key].name}, press ${Number(key) + 1}. `
    }

    say += `To talk to an Agent, press ${result.length + 1}`

    const gather = voiceResponse.gather({
      numDigits: 1,
      action: `${url}/enqueue`,
      method: 'POST'
    })

    gather.say({
      loop: 10
    }, say)
  }
  else {
    const workflows = await workspace.workflows.list({ friendlyName: 'Main' });
    const workflowSid = workflows[0].sid;

    const enqueue = voiceResponse.enqueue({
      workflowSid,
      waitUrl: 'https://twimlets.com/holdmusic?Bucket=com.twilio.music.soft-rock'
  });

    enqueue.task(JSON.stringify({ selected_department: 'Default' }));
  }

  /* await calls.createOne({
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
  }) */

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

router.post('/enqueue', validateTwilioRequest, async (req, res) => {
  console.log('enqueue', req.body);
  const pressedKey = req.body.Digits;
  const voiceResponse = new VoiceResponse();

  const result = await departments.getDeparments();

  const depts = result.map(dept => dept.name);

  depts.push('Default');

  const selectedOpt = depts[Number(pressedKey) + 1];

  const workflows = await workspace.workflows.list({ friendlyName: 'Main' });
  const workflowSid = workflows[0].sid;

  const enqueue = voiceResponse.enqueue({
    workflowSid,
    waitUrl: 'https://twimlets.com/holdmusic?Bucket=com.twilio.music.soft-rock'
  });

  enqueue.task(JSON.stringify({ selected_department: selectedOpt }));

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

// POST /assignment
router.post('/assignment', validateTwilioRequest, (req, res) => {
  console.log('assignment', req.body);
  
  res.type('application/json');
  res.send({
    instruction: "dequeue",
    post_work_activity_sid: idle
  });
});

router.post('/events', validateTwilioRequest, (req, res) => {
  const eventType = req.body.EventType;
  const taskAttributes = (req.body.TaskAttributes)? JSON.parse(req.body.TaskAttributes) : {};

  if(eventType === 'workflow.timeout') {
    const query = querystring.stringify({
      Message: 'Sorry, All agents are busy. Please leave a message. We\'ll call you as soon as possible',
      Email: process.env.MISSED_CALLS_EMAIL_ADDRESS});
    const voicemailUrl = util.format("http://twimlets.com/voicemail?%s", query);
    twilioClient.calls(taskAttributes.call_sid).update({
      method: 'POST',
      url: voicemailUrl
    });
  }

  res.json({});
});

/* router.post('/inbound', validateTwilioRequest, async (req: express.Request, res: express.Response) => {
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
  const dial = voiceResponse.dial()

  const client = dial.client(clientName)

  client.parameter({
    name: 'callId',
    value: result
  })

  res.type('text/xml');
  res.send(voiceResponse.toString());
}); */

/* router.post('/events/', async (req, res) => {
  
}); */

export default router;