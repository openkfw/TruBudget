import * as Workflowitem from "..";
import { throwIfUnauthorized } from "../../authz";
import { allIntents } from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib";
import { MultichainClient } from "../../multichain";

export const revokeWorkflowitemPermission = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);
  const intent = value("intent", input.intent, x => allIntents.includes(x));

  // Is the user allowed to revoke workflowitem permissions?
  await throwIfUnauthorized(
    req.token,
    "workflowitem.intent.revokePermission",
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId),
  );

  await Workflowitem.revokePermission(multichain, projectId, workflowitemId, userId, intent);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
};
