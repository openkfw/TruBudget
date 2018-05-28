import * as Workflowitem from "..";
import { AuthToken } from "../../authz/token";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import { createNotification } from "../../notification/create";

/**
 * If the workflowitem is assigned to someone else, that person is notified about the
 * change.
 */
export async function notifyWorkflowitemAssignee(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  publishedEvent: Event,
): Promise<void> {
  const workflowitem = await Workflowitem.get(
    multichain,
    token,
    projectId,
    subprojectId,
    workflowitemId,
  ).then(x => (x.length ? x[0] : undefined));

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
}
