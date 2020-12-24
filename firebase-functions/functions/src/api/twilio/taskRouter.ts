import * as express from 'express';
import * as functions from 'firebase-functions';
import * as twilio from 'twilio'
import * as taskRouter from '../../taskRouter'
import users from '../../firestore/users'

const router = express.Router();

const accountSid: string = functions.config().twilio.accountsid;
const authToken: string = functions.config().twilio.authtoken;
const workspaceSid: string = functions.config().twilio.workspace_sid;

const client = twilio(accountSid, authToken).taskrouter.v1.workspaces(workspaceSid);

router.post('/worker', async (req, res, next) =>  {
  try {
    const { body } = req;

    const worker = await taskRouter.createWorker({
      id: body.id,
      name: body.name,
      departments: body.departments
    })

    res.json(worker);
  } catch (error) {
    next(error);
  }
});

router.post('/taskQueue', async (req, res, next) => {
  try {
    const taskQueue = await taskRouter.createTaskQueue({
      name: req.body.name
    }, req.body.default)

    res.json(taskQueue);
  } catch (error) {
    next(error);
  }
});

router.post('/workflow', async (req, res, next) => {
  try {
    const workflow = await taskRouter.createWorkflow();

    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

router.put('/worker', async (req, res, next) => {
  try {
    const { workerSid } = req.decoded;
    const { activity } = req.body;

    const activitySid = taskRouter.getActivityByName(activity);

    client.workers(workerSid).update({
      activitySid,
    })
    
  } catch (error) {
    next(error);
  }
});
export default router;
