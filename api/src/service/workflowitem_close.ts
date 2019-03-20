import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as WorkflowitemClose from "./domain/workflow/workflowitem_close";
import * as Subproject from "./domain/workflow/subproject";
import * as GroupQuery from "./group_query";
import { store } from "./store";
import * as Workflowitem from "./domain/workflow/workflowitem";

export async function closeWorkflowitem(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
): Promise<void> {
  const result = await Cache.withCache(conn, ctx, async cache =>
    WorkflowitemClose.closeWorkflowitem(ctx, serviceUser, projectId, subprojectId, workflowitemId, {
      getWorkflowitems: async (projectId, subprojectId) => {
        return cache.getWorkflowitems(projectId, subprojectId);
      },
      getSubproject: async (projectId, subprojectId) => {
        return cache.getSubproject(projectId, subprojectId);
      },
      getUsersForIdentity: async identity => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    }),
  );

  if (Result.isErr(result)) throw result;
  const { newEvents } = result;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
