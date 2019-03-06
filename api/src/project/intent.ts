/**
 * DEPRECATED - see index.ts
 */
import { throwIfUnauthorized } from "../authz";
import { allIntents } from "../authz/intents";
import { HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../service/Client.h";
import * as Project from "./model/Project";

export async function changeProjectPermission(
  multichain: MultichainClient,
  req,
  userIntent: "project.intent.grantPermission" | "project.intent.revokePermission",
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const identity: string = value("identity", input.identity, isNonemptyString);
  const intent = value("intent", input.intent, x => allIntents.includes(x));

  // Is the user allowed to grant/revoke project permissions?
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Project.getPermissions(multichain, projectId),
  );

  const event = {
    intent: userIntent,
    createdBy: req.user.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { identity, intent },
  };

  await Project.publish(multichain, projectId, event);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
}
