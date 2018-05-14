import * as Workflowitem from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { sortWorkflowitems } from "../subproject/lib/sortWorkflowitems";

export const closeWorkflowitem = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);

  const userIntent: Intent = "workflowitem.close";

  // Is the user allowed to close a workflowitem?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId),
  );

  // We need to make sure that all previous (wrt. ordering) workflowitems are already closed:
  const sortedItems = await Workflowitem.get(multichain, req.token, projectId, subprojectId).then(
    unsortedItems => sortWorkflowitems(multichain, projectId, unsortedItems),
  );

  for (const item of sortedItems) {
    if (item.data.id === workflowitemId) {
      break;
    } else if (item.data.status !== "closed") {
      throw {
        kind: "PreconditionError",
        message: "Cannot close workflowitems if there are preceding non-closed workflowitems.",
      };
    }
  }

  const event = {
    intent: userIntent,
    createdBy: req.token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: {},
  };

  await Workflowitem.publish(multichain, projectId, subprojectId, workflowitemId, event);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
};
