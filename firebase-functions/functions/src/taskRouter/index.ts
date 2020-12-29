import * as twilio from 'twilio'
import * as functions from 'firebase-functions';
import departments from '../firestore/departments';

const { idle, offline, bussy, reserved } = functions.config().twilio.workspace_activities;

const accountSid: string = functions.config().twilio.accountsid;
const authToken: string = functions.config().twilio.authtoken;
const workspaceSid: string = functions.config().twilio.workspace_sid;
const url: String = functions.config().twilio.voiceurl

const client = twilio(accountSid, authToken);

const workspace = client.taskrouter.v1.workspaces(workspaceSid);

export const getActivityByName = (name: string): string => {
  let activitySid = '';

  switch (name) {
    case 'idle':
      activitySid = idle;
      break;
    case 'offline':
      activitySid = offline;
      break;
    case 'bussy':
      activitySid = bussy;
    case 'reserved':
      activitySid = reserved;
      break;
    default:
      activitySid = idle;
      break;
  }

  return activitySid;
}

export const createWorker = (opts: any) => {
  return workspace.workers.create({
    friendlyName: opts.name,
    attributes: JSON.stringify({
      'departments': opts.departments,
      'contact_uri': `client:${opts.id}`
    }),
    activitySid: offline
  })
}

export const deleteworker = (workerSid: string) => {
  return workspace.workers(workerSid).remove();
}

export const updateWorker = (workerSid: string, opts: any) => {
  return workspace.workers(workerSid).update({
    friendlyName: opts.name,
    attributes: JSON.stringify({
      'departments': opts.departments,
      'contact_uri': `client:${opts.id}`
    })
  })
}

export const updateWorkerActivity = (workerSid: string, activity: string) => {
  const activitySid = getActivityByName(activity);

  return workspace.workers(workerSid).update({
    activitySid
  })
}

export const createTaskQueue = (dept:any, isDefault = false) => {
  return workspace.taskQueues.create({
    friendlyName: dept.name,
    targetWorkers: !isDefault ? `departments HAS "${dept.name}"` : '1==1',
    assignmentActivitySid: bussy,
    reservationActivitySid: reserved
  })
}

export const deleteTaskQueue = (taskQueueSid: string) => {
  return workspace.taskQueues(taskQueueSid).remove()
}

export const createWorkflow = async () => {
  const config = await createWorkflowConfig();

  const workflow = await workspace.workflows
    .create({
      friendlyName: 'Main',
      assignmentCallbackUrl: `${url}/assignment`,
      fallbackAssignmentCallbackUrl: `${url}/assignment`,
      taskReservationTimeout: 15,
      configuration: config
    })

  return {
    workflowSid: workflow.sid,
    activities: {
      idle,
      offline
    },
    workspaceSid
  }
}

const createWorkflowConfig = async () => {
  const queues = await workspace.taskQueues.list();
  const depts = await departments.getDeparments();

  if (!queues) {
    throw new Error('Queues must be initialized.');
  }

  const defaultTarget = {
    queue: queues.find(queue => queue.friendlyName === 'Default')?.sid,
    timeout: 900,
    priority: 1
  };

  const rules = [];

  for (const dept of depts) {
    const target = {
      queue: queues.find(queue => queue.friendlyName === dept.name)?.sid,
      timeout: 900,
      priority: 5
    }
  
    rules.push({
      expression: `selected_department=="${dept.name}"`,
      targets: [target, defaultTarget]
    })
  }

  const config = {
    task_routing: {
      filters: rules,
      default_filter: defaultTarget
    }
  };

  return JSON.stringify(config);
}

export const putOnHold = async (conferenceSid: string, participantSid: string) => {
  return client.conferences(conferenceSid).participants(participantSid).update({
    hold: true,
    holdUrl: 'https://twimlets.com/holdmusic?Bucket=com.twilio.music.soft-rock'
  })
}

export const transferCall = async (taskSid: string, condition: any) => {

  const workflows = await workspace.workflows.list({ friendlyName: 'Main' });
  const workflowSid = workflows[0].sid;

  const task = await workspace.tasks(taskSid).fetch();

  console.log('task attributes: ', task.attributes);
  
  const newAttributes = {
    ...JSON.parse(task.attributes),
    ...condition
  }

  newAttributes.conference.room_name = taskSid;

  return workspace.tasks.create({
    workflowSid: workflowSid,
    attributes: JSON.stringify(newAttributes),
    taskChannel: 'voice'
  })
}

/* export const createWorkflowActivites = async () => {
  const activityNames = ['Idle', 'Busy', 'Offline', 'Reserved'];

  const activities = await workspace.activities.list();
  const existingActivites = activities.map(activity => activity.friendlyName);

  const missingActivities = activityNames.filter(activity => !existingActivites.includes(activity))

  const newActivities = missingActivities.map(friendlyName => {
    return workspace.activities.create({
      friendlyName,
      available: true
    })
  })

  return Promise.all(newActivities);
} */
