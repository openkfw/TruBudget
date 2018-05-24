import * as Workflowitem from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { sortWorkflowitems } from "../subproject/lib/sortWorkflowitems";
import { createNotification } from "../notification/create";

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
    unsortedItems => sortWorkflowitems(multichain, projectId, subprojectId, unsortedItems),
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

  // If the workflowitem is assigned to someone else, that person is notified about the change:
  const workflowitem = sortedItems.find(item => item.data.id === workflowitemId);
  if (
    workflowitem !== undefined &&
    workflowitem.data.assignee !== undefined &&
    workflowitem.data.assignee !== req.token.userId
  ) {
    await createNotification(
      multichain,
      workflowitemId,
      "workflowitem",
      req.token.userId,
      workflowitem.data.assignee,
    );
  }

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
};
