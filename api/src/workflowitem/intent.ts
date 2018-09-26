import { throwIfUnauthorized } from "../authz";
import { allIntents } from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import * as Workflowitem from "./model/Workflowitem";

export async function changeWorkflowitemPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
  userIntent: "workflowitem.intent.grantPermission" | "workflowitem.intent.revokePermission",
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);
  const identity: string = value("identity", input.identity, isNonemptyString);
  const intent = value("intent", input.intent, x => allIntents.includes(x));

  // Is the user allowed to grant/revoke workflowitem permissions?
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId),
  );

  const event = {
    intent: userIntent,
    createdBy: req.user.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { identity, intent },
  };

  await Workflowitem.publish(multichain, projectId, subprojectId, workflowitemId, event);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
}
