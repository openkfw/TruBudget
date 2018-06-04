import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import { notifyAssignee } from "../../notification/create";
import * as Notification from "../../notification/model/Notification";
import * as Subproject from "../../subproject/model/Subproject";
import { sortWorkflowitems } from "../../subproject/sortWorkflowitems";
import * as Workflowitem from "../model/workflowitem";

export async function closeWorkflowitem(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);

  const userIntent: Intent = "workflowitem.close";

  // Is the user allowed to close a workflowitem?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId),
  );

  // We need to make sure that all previous (wrt. ordering) workflowitems are already closed:
  const sortedItems = await ensureAllPreviousWorkflowitemsAreClosed(
    multichain,
    req.token,
    projectId,
    subprojectId,
    workflowitemId,
  );

  const publishedEvent = await sendEventToDatabase(
    multichain,
    req.token,
    userIntent,
    projectId,
    subprojectId,
    workflowitemId,
  );

  const resourceDescriptions: Notification.NotificationResourceDescription[] = [
    { id: workflowitemId, type: "workflowitem" },
    { id: subprojectId, type: "subproject" },
    { id: projectId, type: "project" },
  ];
  const createdBy = req.token.userId;

  // If the workflowitem is assigned to someone else, that person is notified about the
  // change:
  const workflowitemAssignee = await notifyAssignee(
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
    [req.token.userId], // skipNotificationsFor
  );

  // If the parent subproject is (1) not assigned to the token user and (2) not assigned
  // to the same guy the workflowitem is assigned to, that person is notified about the
  // change too.
  console.log(`the workflowitem assignee: ${workflowitemAssignee}`);
  const skipNotificationsFor = [req.token.userId].concat(
    workflowitemAssignee ? [workflowitemAssignee] : [],
  );
  console.log(` => skip notifications for ${skipNotificationsFor}`);
  await notifyAssignee(
    multichain,
    resourceDescriptions,
    createdBy,
    await Subproject.get(
      multichain,
      req.token,
      projectId,
      subprojectId,
      "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!",
    ),
    publishedEvent,
    skipNotificationsFor,
  );

  return [200, { apiVersion: "1.0", data: "OK" }];
}

async function ensureAllPreviousWorkflowitemsAreClosed(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<Workflowitem.WorkflowitemResource[]> {
  const sortedItems = await Workflowitem.get(multichain, token, projectId, subprojectId).then(
    unsortedItems => sortWorkflowitems(multichain, projectId, subprojectId, unsortedItems),
  );
  for (const item of sortedItems) {
    if (item.data.id === workflowitemId) {
      break;
    } else if (item.data.status !== "closed") {
      throw {
        kind: "PreconditionError",
        message: "Cannot close workflowitems if there are preceding non-closed workflowitems.",
      };
    }
  }
  return sortedItems;
}

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: {},
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
