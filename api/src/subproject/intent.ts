import { throwIfUnauthorized } from "../authz";
import { allIntents } from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import * as Subproject from "./model/Subproject";

export async function changeSubprojectPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
  userIntent: "subproject.intent.grantPermission" | "subproject.intent.revokePermission",
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);
  const intent = value("intent", input.intent, x => allIntents.includes(x));

  // Is the user allowed to grant/revoke subproject permissions?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  const event = {
    intent: userIntent,
    createdBy: req.token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { userId, intent },
  };

  await Subproject.publish(multichain, projectId, subprojectId, event);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
}
