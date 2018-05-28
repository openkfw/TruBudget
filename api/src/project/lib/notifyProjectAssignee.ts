import { AuthToken } from "../../authz/token";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import { createNotification } from "../../notification/create";
import * as Project from "../model/Project";

/**
 * If the project is assigned to someone else, that person is notified about the
 * change.
 */
export async function notifyProjectAssignee(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  publishedEvent: Event,
): Promise<void> {
  const project = await Project.get(multichain, token, projectId).then(
    x => (x.length ? x[0] : undefined),
  );

  if (project === undefined) return;
  const assignee = project.data.assignee;

  if (assignee === undefined || assignee === token.userId) return;

  await createNotification(
    multichain,
    [{ id: projectId, type: "project" }],
    token.userId,
    assignee,
    publishedEvent,
  );
}
