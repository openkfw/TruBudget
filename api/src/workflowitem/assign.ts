import * as Workflowitem from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { Event } from "../multichain/event";
import { notifyWorkflowitemAssignee } from "./lib/notifyAssignee";

export const assignWorkflowitem = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);

  const userIntent: Intent = "workflowitem.assign";

  // Is the user allowed to (re-)assign a workflowitem?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId),
  );

  const publishedEvent = await sendEventToDatabase(
    multichain,
    req.token,
    userIntent,
    userId,
    projectId,
    subprojectId,
    workflowitemId,
  );

  await notifyWorkflowitemAssignee(
    multichain,
    req.token,
    projectId,
    subprojectId,
    workflowitemId,
    publishedEvent,
  );

  return [200, { apiVersion: "1.0", data: "OK" }];
};

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  userId: string,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { userId },
  };
  const publishedEvent = await Workflowitem.publish(
    multichain,
    projectId,
    subprojectId,
    workflowitemId,
    event,
  );
  return publishedEvent;
}
