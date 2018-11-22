import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import logger from "../../lib/logger";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import { notifyAssignee } from "../../notification/create";
import * as Notification from "../../notification/model/Notification";
import * as Subproject from "../../subproject/model/Subproject";
import * as Project from "../model/Project";

export async function closeProject(multichain: MultichainClient, req): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);

  const userIntent: Intent = "project.close";

  // Is the user allowed to close a project?
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Project.getPermissions(multichain, projectId),
  );

  // All assiciated subprojects need to be closed:
  if (!(await Subproject.areAllClosed(multichain, projectId))) {
    logger.error(
      { error: { multichain, projectId } },
      "Cannot close a project if at least one associated subproject is not yet closed.",
    );
    throw {
      kind: "PreconditionError",
      message: "Cannot close a project if at least one associated subproject is not yet closed.",
    };
  }

  const publishedEvent = await sendEventToDatabase(multichain, req.user, userIntent, projectId);

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

  return [200, { apiVersion: "1.0", data: "OK" }];
}

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  projectId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: {},
  };
  const publishedEvent = await Project.publish(multichain, projectId, event);
  return publishedEvent;
}
