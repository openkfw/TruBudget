import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import { notifyAssignee } from "../../notification/create";
import * as Notification from "../../notification/model/Notification";
import * as Workflowitem from "../model/Workflowitem";

export async function assignWorkflowitem(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);
  const identity: string = value("identity", input.identity, isNonemptyString);

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
    identity,
    projectId,
    subprojectId,
    workflowitemId,
  );

  // If the workflowitem is assigned to someone else, that person is notified about the
  // change:
  const resourceDescriptions: Notification.NotificationResourceDescription[] = [
    { id: workflowitemId, type: "workflowitem" },
    { id: subprojectId, type: "subproject" },
    { id: projectId, type: "project" },
  ];
  const createdBy = req.token.userId;
  const skipNotificationsFor = [req.token.userId];
  await notifyAssignee(
    multichain,
    resourceDescriptions,
    createdBy,
    await Workflowitem.get(
      multichain,
      req.token,
      projectId,
      subprojectId,
      workflowitemId,
      "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!",
    ),
    publishedEvent,
    skipNotificationsFor,
  );

  return [200, { apiVersion: "1.0", data: "OK" }];
}

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  identity: string,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { identity },
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
