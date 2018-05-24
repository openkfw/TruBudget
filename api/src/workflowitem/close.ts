import * as Workflowitem from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { createNotification } from "../notification/create";
import { sortWorkflowitems } from "../subproject/lib/sortWorkflowitems";
import * as Subproject from "../subproject/model/Subproject";

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

  const publishedEvent = await Workflowitem.publish(
    multichain,
    projectId,
    subprojectId,
    workflowitemId,
    event,
  );

  // If the workflowitem is assigned to someone else, that person is notified about the change:
  const workflowitem = sortedItems.find(item => item.data.id === workflowitemId);
  if (
    workflowitem !== undefined &&
    workflowitem.data.assignee !== undefined &&
    workflowitem.data.assignee !== req.token.userId
  ) {
    await createNotification(
      multichain,
      [
        { id: workflowitemId, type: "workflowitem" },
        { id: subprojectId, type: "subproject" },
        { id: projectId, type: "project" },
      ],
      req.token.userId,
      workflowitem.data.assignee,
      publishedEvent,
    );
  }
  // If the associated subproject is
  // (1) assigned to someone else and
  // (2) not assigned to the same guy the workflowitem is assigned to,
  // that person is notified about the change too:
  const subproject = await Subproject.get(multichain, req.token, projectId, subprojectId).then(
    x => (x.length ? x[0] : undefined),
  );
  if (
    subproject !== undefined &&
    subproject.data.assignee !== undefined &&
    subproject.data.assignee !== req.token.userId &&
    (workflowitem === undefined || subproject.data.assignee !== workflowitem.data.assignee)
  ) {
    await createNotification(
      multichain,
      [
        { id: workflowitemId, type: "workflowitem" },
        { id: subprojectId, type: "subproject" },
        { id: projectId, type: "project" },
      ],
      req.token.userId,
      subproject.data.assignee,
      publishedEvent,
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
