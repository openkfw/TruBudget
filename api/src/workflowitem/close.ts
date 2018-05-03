import { throwIfUnauthorized } from "../authz";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient } from "../multichain";
import { sortWorkflowitems } from "../subproject/lib/sortSubprojects";
import * as Workflowitem from "./index";

export const closeWorkflowitem = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);

  // Is the user allowed to close a workflowitem?
  await throwIfUnauthorized(
    req.token,
    "workflowitem.close",
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId),
  );

  // We need to make sure that all previous (wrt. ordering) workflowitems are already closed:
  const allItems = await Workflowitem.getAll(multichain, projectId, subprojectId).then(
    unsortedItems => sortWorkflowitems(multichain, projectId, unsortedItems),
  );
  for (const item of allItems) {
    if (item.data.id === workflowitemId) {
      break;
    } else if (item.data.status !== "closed") {
      throw {
        kind: "PreconditionError",
        message: "Cannot close workflowitems if there are preceding non-closed workflowitems.",
      };
    }
  }

  await Workflowitem.close(multichain, projectId, workflowitemId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
};
