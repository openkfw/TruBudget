import { Ctx } from "../lib/ctx";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemAssign from "./domain/workflow/workflowitem_assign";
import { store } from "./store";

export async function assignWorkflowitem(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  assignee: Identity,
): Promise<void> {
  const { newEvents, errors } = await Cache.withCache(conn, ctx, async cache => {
    return WorkflowitemAssign.assignWorkflowitem(
      ctx,
      serviceUser,
      assignee,
      projectId,
      subprojectId,
      workflowitemId,
      await cache.getWorkflowitemEvents(projectId, subprojectId, workflowitemId),
    );
  });

  if (errors.length > 0) return Promise.reject(errors);

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
