import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import { notifyAssignee } from "../../notification/create";
import * as Notification from "../../notification/model/Notification";
import * as Project from "../../project/model/Project";
import * as Workflowitem from "../../workflowitem/model/Workflowitem";
import * as Subproject from "../model/Subproject";
import logger from "../../lib/logger";

export const closeSubproject = async (multichain: MultichainClient, req): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const userIntent: Intent = "subproject.close";

  // Is the user allowed to close a subproject?
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  // All assiciated workflowitems need to be closed:
  if (!(await Workflowitem.areAllClosed(multichain, projectId, subprojectId))) {
    const message =
      "Cannot close a subproject if at least one associated workflowitem is not yet closed.";
    logger.debug({ error: { multichain, projectId, subprojectId } }, message);
    throw {
      kind: "PreconditionError",
      message,
    };
  }

  const publishedEvent = await sendEventToDatabase(
    multichain,
    req.user,
    userIntent,
    projectId,
    subprojectId,
  );

  const resourceDescriptions: Notification.NotificationResourceDescription[] = [
    { id: subprojectId, type: "subproject" },
    { id: projectId, type: "project" },
  ];
  const createdBy = req.user.userId;

  // If the subproject is assigned to someone else, that person is notified about the
  // change:
  const subprojectAssignee = await notifyAssignee(
    multichain,
    resourceDescriptions,
    createdBy,
    await Subproject.get(
      multichain,
      req.user,
      projectId,
      subprojectId,
      "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!",
    ),
    publishedEvent,
    [req.user.userId], // skipNotificationsFor
  );

  // If the parent project is (1) not assigned to the token user and (2) not assigned to
  // the same guy the subproject is assigned to, that person is notified about the change
  // too.
  const skipNotificationsFor = [req.user.userId].concat(
    subprojectAssignee ? [subprojectAssignee] : [],
  );
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
};

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  projectId: string,
  subprojectId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: {},
  };
  const publishedEvent = await Subproject.publish(multichain, projectId, subprojectId, event);
  return publishedEvent;
}
