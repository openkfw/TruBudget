import * as Workflowitem from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { createNotification } from "../notification/create";

export const assignWorkflowitem = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);

  const userIntent: Intent = "workflowitem.assign";

  // Is the user allowed to (re-)assign a workflowitem?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId),
  );

  const event = {
    intent: userIntent,
    createdBy: req.token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { userId },
  };

  await Workflowitem.publish(multichain, projectId, subprojectId, workflowitemId, event);

  // If the workflowitem has been assigned to someone else, that person is notified about the change:
  const workflowitem = await Workflowitem.get(
    multichain,
    req.token,
    projectId,
    subprojectId,
    workflowitemId,
  ).then(x => x[0]);
  if (workflowitem.data.assignee !== undefined && workflowitem.data.assignee !== req.token.userId) {
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
