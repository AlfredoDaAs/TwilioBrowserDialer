import * as express from 'express';
import * as functions from 'firebase-functions';
import * as twilio from 'twilio'
import * as taskRouter from '../../taskRouter'
import users from '../../firestore/users'
import departments from '../../firestore/departments'

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

router.post('/worker/activity/:activity', async (req, res, next) => {
  try {
    const { activity } = req.params;
    const { workerSid } = req.decoded;

    await taskRouter.updateWorkerActivity(workerSid, activity);

    res.json(true)
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

router.post('/updateWorkers', async (req, res, next) => {
  try {
    const usersList = await users.getAllUsers();
    const workers = await client.workers.list();
    // let created = 0

    usersList.forEach(async (user) => {
      const worker = workers.find((worker:any) => {
        return JSON.parse(worker.attributes).contact_uri === `client:${user.id}`
      })

      if(!worker) {
        const result = await taskRouter.createWorker({
          id: user.id,
          name: `${user.name} ${user.lastName}`,
          departments: user.departments ? user.departments : []
        })

        await users.updateOne(user.id, {
          workerSid: result.sid
        })

        // created++
      } else {
        await taskRouter.updateWorker(worker.sid, {
          id: user.id,
          name: `${user.name} ${user.lastName}`,
          departments: user.departments ? user.departments : []
        })
      }
    })

    res.json(true);
  } catch (error) {
    next(error);
  }
})

router.post('/batch/taskQueue', async (req, res, next) => {
  try {
    const depts = await departments.getDeparments();
    const taskQueues = await client.taskQueues.list();
    let taskQueuesCreated = 0

    depts.forEach(async (dept) => {
      const taskQueue = taskQueues.find(queue => queue.friendlyName === dept.name);

      if(!taskQueue) {
        await taskRouter.createTaskQueue({
          name: dept.name
        })
        taskQueuesCreated++;
      }
    })

    res.json({
      created: taskQueuesCreated
    })
  } catch (error) {
    next(error);
  }
})

router.post('/putOnHold/:conferenceSid/:participantSid', async (req, res, next) => {
  try {
    const { conferenceSid, participantSid } = req.params;

    const result = await taskRouter.putOnHold(conferenceSid, participantSid)

    res.json({
      callSid: result.callSid,
      conferenceSid: result.conferenceSid
    })
  } catch (error) {
    next(error);
  }
})

router.post('/transfer', async (req, res, next) => {
  try {
    const { conferenceSid, participantSid, taskSid, department, agentId } = req.body;

    await taskRouter.putOnHold(conferenceSid, participantSid);

    const condition = {} as any

    if(agentId) {
      condition.contact_uri = `client:${agentId}`
    } else if(department) {
      condition.selected_department = department
    }

    const result = await taskRouter.transferCall(taskSid, condition)

    res.json(result.sid)
  } catch (error) {
    next(error);
  }
})

/* router.put('/task', async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
}) */

export default router;
