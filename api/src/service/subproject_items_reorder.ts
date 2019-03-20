import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectItemsReorder from "./domain/workflow/subproject_items_reorder";
import { WorkflowitemOrdering } from "./domain/workflow/workflowitem_ordering";
import { store } from "./store";

export async function reorderSubprojectItems(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  ordering: WorkflowitemOrdering,
): Promise<void> {
  const result = await Cache.withCache(conn, ctx, async cache =>
    SubprojectItemsReorder.reorderSubprojectItems(
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      ordering,
      {
        getSubproject: async (projectId, subprojectId) =>
          cache.getSubproject(projectId, subprojectId),
      },
    ),
  );

  if (Result.isErr(result)) throw result;
  const { newEvents } = result;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
