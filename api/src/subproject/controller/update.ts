import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { HttpResponse } from "../../httpd/lib";
import { Ctx } from "../../lib/ctx";
import { isEmpty } from "../../lib/emptyChecks";
import { inheritDefinedProperties } from "../../lib/inheritDefinedProperties";
import { isNonemptyString, value } from "../../lib/validation";
import { notifyAssignee } from "../../notification/create";
import * as Notification from "../../notification/model/Notification";
import { ConnToken } from "../../service";
import { MultichainClient } from "../../service/Client.h";
import { ServiceUser } from "../../service/domain/organization/service_user";
import { Event } from "../../service/event";
import * as Subproject from "../model/Subproject";
import logger from "../../lib/logger";

export async function updateSubproject(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  req,
): Promise<HttpResponse> {
  const multichain = conn.multichainClient;

  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const theUpdate: Subproject.Update = {};
  inheritDefinedProperties(theUpdate, input, ["displayName", "description", "currency"]);
  if (input.additionalData !== undefined) theUpdate.additionalData = input.additionalData;

  if (isEmpty(theUpdate)) {
    return ok();
  }

  const userIntent: Intent = "subproject.update";

  // Is the user allowed to update a subproject's basic data?
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  const publishedEvent = await sendEventToDatabase(
    multichain,
    req.user,
    userIntent,
    theUpdate,
    projectId,
    subprojectId,
  );

  // If the suproject is assigned to someone else, that person is notified about the
  // change:
  // const resourceDescriptions: Notification.NotificationResourceDescription[] = [
  //   { id: subprojectId, type: "subproject" },
  //   { id: projectId, type: "project" },
  // ];
  // const createdBy = req.user.userId;
  // const skipNotificationsFor = [req.user.userId];
  // await notifyAssignee(
  //   conn,
  //   ctx,
  //   issuer,
  //   resourceDescriptions,
  //   createdBy,
  //   await Subproject.get(
  //     multichain,
  //     req.user,
  //     projectId,
  //     subprojectId,
  //     "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!",
  //   ),
  //   publishedEvent,
  //   skipNotificationsFor,
  // );

  return ok();
}

function ok(): HttpResponse {
  return [200, { apiVersion: "1.0", data: "OK" }];
}

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  theUpdate: Subproject.Update,
  projectId: string,
  subprojectId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: theUpdate,
  };
  const publishedEvent = await Subproject.publish(multichain, projectId, subprojectId, event);
  return publishedEvent;
}
