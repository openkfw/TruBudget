/**
 * DEPRECATED - see index.ts
 */
import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { HttpResponse } from "../../httpd/lib";
import { isEmpty } from "../../lib/emptyChecks";
import { inheritDefinedProperties } from "../../lib/inheritDefinedProperties";
import { isNonemptyString, value } from "../../lib/validation";
import { notifyAssignee } from "../../notification/create";
import * as Notification from "../../notification/model/Notification";
import { MultichainClient } from "../../service/Client.h";
import { Event } from "../../service/event";
import * as Project from "../model/Project";

export async function updateProject(multichain: MultichainClient, req): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);

  const theUpdate: Project.Update = {};
  inheritDefinedProperties(theUpdate, input, [
    "displayName",
    "description",
    "amount",
    "currency",
    "thumbnail",
  ]);

  if (isEmpty(theUpdate)) {
    return ok();
  }

  const userIntent: Intent = "project.update";

  // Is the user allowed to update a project's basic data?
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Project.getPermissions(multichain, projectId),
  );

  const publishedEvent = await sendEventToDatabase(
    multichain,
    req.user,
    userIntent,
    theUpdate,
    projectId,
  );

  // If the project is assigned to someone else, that person is notified about the
  // change:
  const resourceDescriptions: Notification.NotificationResourceDescription[] = [
    { id: projectId, type: "project" },
  ];
  const createdBy = req.user.userId;
  const skipNotificationsFor = [req.user.userId];
  await notifyAssignee(
    multichain,
    resourceDescriptions,
    createdBy,
    await Project.get(
      multichain,
      req.user,
      projectId,
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
  theUpdate: Project.Update,
  projectId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: theUpdate,
  };
  const publishedEvent = await Project.publish(multichain, projectId, event);
  return publishedEvent;
}
