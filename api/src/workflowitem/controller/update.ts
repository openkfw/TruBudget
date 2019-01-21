import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isEmpty } from "../../lib/emptyChecks";
import { inheritDefinedProperties } from "../../lib/inheritDefinedProperties";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain/Client.h";
import { Event } from "../../multichain/event";
import { notifyAssignee } from "../../notification/create";
import * as Notification from "../../notification/model/Notification";
import { hashDocuments } from "../../subproject/controller/createWorkflowitem";
import * as Workflowitem from "../model/Workflowitem";

export async function updateWorkflowitem(multichain: MultichainClient, req): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);

  const theUpdate: Workflowitem.Update = {};
  inheritDefinedProperties(theUpdate, input, [
    "displayName",
    "description",
    "amount",
    "currency",
    "amountType",
  ]);

  if (!isEmpty(input.documents)) {
    theUpdate.documents = await hashDocuments(input.documents);
  }
  if (isEmpty(theUpdate)) {
    return ok();
  }
  if (theUpdate.amountType === "N/A") {
    delete theUpdate.amount;
    delete theUpdate.currency;
  }

  const userIntent: Intent = "workflowitem.update";

  // Is the user allowed to update a workflowitem's basic data?
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId),
  );

  const publishedEvent = await sendEventToDatabase(
    multichain,
    req.user,
    userIntent,
    theUpdate,
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
  const createdBy = req.user.userId;
  const skipNotificationsFor = [req.user.userId];
  await notifyAssignee(
    multichain,
    resourceDescriptions,
    createdBy,
    await Workflowitem.get(
      multichain,
      req.user,
      projectId,
      subprojectId,
      workflowitemId,
      "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!",
    ),
    publishedEvent,
    skipNotificationsFor,
  );

  return ok();
}

function ok(): HttpResponse {
  return [200, { apiVersion: "1.0", data: "OK" }];
}

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  theUpdate: Workflowitem.Update,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: theUpdate,
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
