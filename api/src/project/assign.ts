import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { Event } from "../multichain/event";
import { createNotification } from "../notification/create";
import * as Project from "./model/Project";

export const assignProject = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);

  const userIntent: Intent = "project.assign";

  // Is the user allowed to (re-)assign a project?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Project.getPermissions(multichain, projectId),
  );

  const publishedEvent = await sendEventToDatabase(
    multichain,
    req.token,
    userIntent,
    userId,
    projectId,
  );

  await notifyProjectAssignee(multichain, req.token, projectId, publishedEvent);

  return [200, { apiVersion: "1.0", data: "OK" }];
};

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  userId: string,
  projectId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { userId },
  };
  const publishedEvent = await Project.publish(multichain, projectId, event);
  return publishedEvent;
}

/**
 * If the project is assigned to someone else, that person is notified about the
 * change.
 */
async function notifyProjectAssignee(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  publishedEvent: Event,
): Promise<void> {
  const project = await Project.get(multichain, token, projectId).then(
    x => (x.length ? x[0] : undefined),
  );

  if (project === undefined) return;
  const assignee = project.data.assignee;

  if (assignee === undefined || assignee === token.userId) return;

  await createNotification(
    multichain,
    [{ id: projectId, type: "project" }],
    token.userId,
    assignee,
    publishedEvent,
  );
}
