import * as Subproject from "..";
import { throwIfUnauthorized } from "../../authz";
import { allIntents } from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib";
import { MultichainClient } from "../../multichain";

export const revokeSubprojectPermission = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);
  const intent = value("intent", input.intent, x => allIntents.includes(x));

  // Is the user allowed to revoke subproject permissions?
  await throwIfUnauthorized(
    req.token,
    "subproject.intent.revokePermission",
    await Subproject.getPermissions(multichain, projectId, subprojectId)
  );

  await Subproject.revokePermission(multichain, projectId, subprojectId, userId, intent);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK"
    }
  ];
};
