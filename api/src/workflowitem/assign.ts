import { throwIfUnauthorized } from "../authz";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient } from "../multichain";
import * as Workflowitem from "./index";

export const assignWorkflowitem = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);

  // Is the user allowed to (re-)assign a workflowitem?
  await throwIfUnauthorized(
    req.token,
    "workflowitem.assign",
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId)
  );

  await Workflowitem.assign(multichain, projectId, workflowitemId, userId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK"
    }
  ];
};
