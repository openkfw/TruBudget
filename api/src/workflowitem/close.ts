import * as Workflowitem from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { Event } from "../multichain/event";
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
  const sortedItems = await ensureAllPreviousWorkflowitemsAreClosed(
    multichain,
    req.token,
    projectId,
    subprojectId,
    workflowitemId,
  );

  const publishedEvent = await sendEventToDatabase(
    multichain,
    req.token,
    userIntent,
    projectId,
    subprojectId,
    workflowitemId,
  );

  const workflowitemAssignee = await notifyWorkflowitemAssignee(
    multichain,
    req.token,
    projectId,
    subprojectId,
    workflowitemId,
    publishedEvent,
    sortedItems,
  );
  await notifySubprojectAssignee(
    multichain,
    req.token,
    projectId,
    subprojectId,
    workflowitemId,
    publishedEvent,
    workflowitemAssignee,
  );

  return [200, { apiVersion: "1.0", data: "OK" }];
};

async function ensureAllPreviousWorkflowitemsAreClosed(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<Workflowitem.WorkflowitemResource[]> {
  const sortedItems = await Workflowitem.get(multichain, token, projectId, subprojectId).then(
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
  return sortedItems;
}

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
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
  return publishedEvent;
}

/**
 * If the workflowitem is assigned to someone else, that person is notified about the
 * change.
 *
 * @returns The workflowitem assignee, or undefined if unset.
 */
async function notifyWorkflowitemAssignee(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  publishedEvent: Event,
  sortedItems: Workflowitem.WorkflowitemResource[],
): Promise<string | undefined> {
  const workflowitem = sortedItems.find(item => item.data.id === workflowitemId);

  if (workflowitem === undefined) return;
  const assignee = workflowitem.data.assignee;

  if (assignee === undefined || assignee === token.userId) return;

  await createNotification(
    multichain,
    [
      { id: workflowitemId, type: "workflowitem" },
      { id: subprojectId, type: "subproject" },
      { id: projectId, type: "project" },
    ],
    token.userId,
    assignee,
    publishedEvent,
  );
  return assignee;
}

/**
 *  If the associated subproject is (1) assigned to someone else and (2) not assigned to
 *  the same guy the workflowitem is assigned to, that person is notified about the
 *  change too.
 */
async function notifySubprojectAssignee(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  publishedEvent: Event,
  workflowitemAssignee?: string,
): Promise<void> {
  const subproject = await Subproject.get(multichain, token, projectId, subprojectId).then(
    x => (x.length ? x[0] : undefined),
  );

  if (subproject === undefined) return;
  const subprojectAssignee = subproject.data.assignee;

  if (
    subprojectAssignee === undefined ||
    subprojectAssignee === token.userId ||
    subprojectAssignee === workflowitemAssignee
  ) {
    return;
  }

  await createNotification(
    multichain,
    [
      { id: workflowitemId, type: "workflowitem" },
      { id: subprojectId, type: "subproject" },
      { id: projectId, type: "project" },
    ],
    token.userId,
    subprojectAssignee,
    publishedEvent,
  );
}
