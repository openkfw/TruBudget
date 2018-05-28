import { AuthToken } from "../../authz/token";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import { createNotification } from "../../notification/create";
import * as Subproject from "../model/Subproject";

/**
 * If the subproject is assigned to someone else, that person is notified about the
 * change.
 */
export async function notifySubprojectAssignee(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  publishedEvent: Event,
): Promise<void> {
  const subproject = await Subproject.get(multichain, token, projectId, subprojectId).then(
    x => (x.length ? x[0] : undefined),
  );

  if (subproject === undefined) return;
  const assignee = subproject.data.assignee;

  if (assignee === undefined || assignee === token.userId) return;

  await createNotification(
    multichain,
    [{ id: subprojectId, type: "subproject" }, { id: projectId, type: "project" }],
    token.userId,
    assignee,
    publishedEvent,
  );
}
