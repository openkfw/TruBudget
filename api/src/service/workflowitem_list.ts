import { Ctx } from "../lib/ctx";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemList from "./domain/workflow/workflowitem_list";

export async function listWorkflowitems(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: string,
  subprojectId: string,
): Promise<Workflowitem.Workflowitem[]> {
  const visibleWorkflowitems = await Cache.withCache(conn, ctx, async cache =>
    WorkflowitemList.getAllVisible(ctx, serviceUser, {
      getAllWorkflowitemEvents: async () => {
        return cache.getWorkflowitemEvents(projectId, subprojectId);
      },
    }),
  );
  return visibleWorkflowitems;
}
