import { throwIfUnauthorized } from "../authz";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient } from "../multichain";
import * as Workflowitem from "./index";

export const closeWorkflowitem = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);

  // Is the user allowed to close a workflowitem?
  await throwIfUnauthorized(
    req.token,
    "workflowitem.close",
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId)
  );

  // TODO(#57) Condition for closing a workflowitem: the workflowitem must be the _first_
  // non-closed workflowitem (with respect to the current ordering)

  await Workflowitem.close(multichain, projectId, workflowitemId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK"
    }
  ];
};
