import * as twilio from 'twilio'
import * as functions from 'firebase-functions';
import departments from '../firestore/departments';

const { idle, offline, bussy, reserved } = functions.config().twilio.workspace_activities;

const accountSid = functions.config().twilio.accountsid;
const authToken = functions.config().twilio.authtoken;
const workspaceSid = functions.config().twilio.workspace_sid;
const url: String = functions.config().twilio.voiceurl

const client = twilio(accountSid, authToken);

const workspace = client.taskrouter.v1.workspaces(workspaceSid);

export const createWorker = (opts: any) => {
  return workspace.workers.create({
    friendlyName: opts.name,
    attributes: JSON.stringify({
      'departments': opts.departments,
      'contact_uri': opts.id, // clientName Id
    }),
    activitySid: offline,
  })
}

export const createTaskQueue = (dept:any, isDefault = false) => {
  return workspace.taskQueues.create({
    friendlyName: dept.name,
    targetWorkers: !isDefault ? `departments HAS "${dept.name}"` : '1==1',
    assignmentActivitySid: bussy,
    reservationActivitySid: reserved,
  })

  /* return Promise.all([
    // create departments
    workspace.taskQueues.create({
      friendlyName: 'Default',
      targetWorkers: '1==1',
      assignmentActivitySid: busyActivity ? busyActivity.sid : undefined,
      reservationActivitySid: reservedActivity ? reservedActivity.sid : undefined,
    })
  ]) */
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
      offline,
    },
    workspaceSid,
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
    priority: 1,
  };

  const rules = [];

  for (const dept of depts) {
    const target = {
      queue: queues.find(queue => queue.friendlyName === dept.name)?.sid,
      timeout: 900,
      priority: 5,
    }
  
    rules.push({
      expression: `selected_department=="${dept.name}"`,
      targets: [target, defaultTarget]
    })
  }

  const config = {
    task_routing: {
      filters: rules,
      default_filter: defaultTarget,
    },
  };

  return JSON.stringify(config);
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
