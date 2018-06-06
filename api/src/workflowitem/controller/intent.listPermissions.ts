import { throwIfUnauthorized } from "../../authz";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import * as Workflowitem from "../model/Workflowitem";

export async function getWorkflowitemPermissions(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const input = req.query;

  const projectId = value("projectId", input.projectId, isNonemptyString);
  const workflowitemId = value("workflowitemId", input.workflowitemId, isNonemptyString);

  const workflowitemPermissions = await Workflowitem.getPermissions(
    multichain,
    projectId,
    workflowitemId,
  );

  // Is the user allowed to list workflowitem permissions?
  await throwIfUnauthorized(
    req.token,
    "workflowitem.intent.listPermissions",
    workflowitemPermissions,
  );

  return [
    200,
    {
      apiVersion: "1.0",
      data: workflowitemPermissions,
    },
  ];
}
