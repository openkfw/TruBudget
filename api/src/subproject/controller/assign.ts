import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { HttpResponse } from "../../httpd/lib";
import { Ctx } from "../../lib/ctx";
import { isNonemptyString, value } from "../../lib/validation";
import { notifyAssignee } from "../../notification/create";
import * as Notification from "../../notification/model/Notification";
import { ConnToken } from "../../service";
import { MultichainClient } from "../../service/Client.h";
import { ServiceUser } from "../../service/domain/organization/service_user";
import { Event } from "../../service/event";
import * as Subproject from "../model/Subproject";

export const assignSubproject = async (
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  req,
): Promise<HttpResponse> => {
  const multichain = conn.multichainClient;

  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const identity: string = value("identity", input.identity, isNonemptyString);

  const userIntent: Intent = "subproject.assign";

  // Is the user allowed to (re-)assign a subproject?
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  const publishedEvent = await sendEventToDatabase(
    multichain,
    req.user,
    userIntent,
    identity,
    projectId,
    subprojectId,
  );

  // If the subproject is assigned to someone else, that person is notified about the
  // change:
  const resourceDescriptions: Notification.NotificationResourceDescription[] = [
    { id: subprojectId, type: "subproject" },
    { id: projectId, type: "project" },
  ];
  const createdBy = req.user.userId;
  const skipNotificationsFor = [req.user.userId];
  await notifyAssignee(
    conn,
    ctx,
    issuer,
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
    skipNotificationsFor,
  );

  return [200, { apiVersion: "1.0", data: "OK" }];
};

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  identity: string,
  projectId: string,
  subprojectId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { identity },
  };
  const publishedEvent = await Subproject.publish(multichain, projectId, subprojectId, event);
  return publishedEvent;
}
