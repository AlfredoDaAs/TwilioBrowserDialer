import * as express from 'express'
import * as functions from 'firebase-functions';
import * as twilio from 'twilio'
import users from '../../firestore/users'

const router = express.Router()

const accountSid = functions.config().twilio.accountsid
const authToken = functions.config().twilio.authtoken
const workspaceSid: string = functions.config().twilio.workspace_sid;

const util = twilio.jwt.taskrouter.util
const ClientCapability = twilio.jwt.ClientCapability
const TaskRouterCapability = twilio.jwt.taskrouter.TaskRouterCapability
const Policy = TaskRouterCapability.Policy;

const TASKROUTER_BASE_URL = 'https://taskrouter.twilio.com';
const version = 'v1';

// Helper function to create Policy
const buildWorkspacePolicy = (options: any, postFilter = {}) => {
  options = options || {};
  var resources = options.resources || [];
  var urlComponents = [TASKROUTER_BASE_URL, version, 'Workspaces', workspaceSid]

  return new Policy({
    url: urlComponents.concat(resources).join('/'),
    method: options.method || 'GET',
    allow: true,
    postFilter,
  });
}

// Generate a Twilio Client capability token
router.get('/:id', async (request, response, next) => {
  const user = await users.readOne(request.params.id);

  if (user) {
    const clientCapability = new ClientCapability({
      accountSid,
      authToken,
      ttl: 28800 // token will live for 8 work hours
    });

    const taskRouterCapability = new TaskRouterCapability({
      accountSid,
      authToken,
      channelId: user.workerSid,
      workspaceSid,
      ttl: 28800
    });

    const eventBridgePolicies = util.defaultEventBridgePolicies(accountSid, user.workerSid);
    const workerPolicies = util.defaultWorkerPolicies(version, workspaceSid, user.workerSid);

    const workspacePolicies = [
      // Workspace fetch Policy
      buildWorkspacePolicy(undefined),
      // Workspace subresources fetch Policy
      buildWorkspacePolicy({ resources: ['**'] }),
      // Workspace Activities Update Policy
      buildWorkspacePolicy({ resources: ['Activities'], method: 'POST' }),
      // Workspace Activities Worker Reservations Policy
      buildWorkspacePolicy({ resources: ['Workers', user.workerSid, 'Reservations', '**'], method: 'POST' }),
      // workers update activity
      // buildWorkspacePolicy({ resources: ['Workers', user.workerSid, '**'], method: 'POST' }, { ActivitySid: { required: true } }),
      // task update
      buildWorkspacePolicy({ resources: ['Tasks', '**'], method: 'POST' }, { AssignmentStatus: { required: true } }),
    ];

    eventBridgePolicies.concat(workerPolicies).concat(workspacePolicies).forEach((policy) => {
      taskRouterCapability.addPolicy(policy)
    })

    clientCapability.addScope(new ClientCapability.IncomingClientScope(user.id));
    clientCapability.addScope(
      new ClientCapability.OutgoingClientScope({
        applicationSid: functions.config().twilio.applicationsid
      })
    );

    const token = clientCapability.toJwt();
    const trToken = taskRouterCapability.toJwt();

    // Include token in a JSON response
    response.send({
      token: token,
      trToken
    });
  } else {
    next(new Error('User not found'));
  }
});

export default router;