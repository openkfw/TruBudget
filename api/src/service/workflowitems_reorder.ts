import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as WorkflowitemsReorder from "./domain/workflow/workflowitems_reorder";
import { WorkflowitemOrdering } from "./domain/workflow/workflowitem_ordering";
import { store } from "./store";

export async function setWorkflowitemOrdering(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  ordering: WorkflowitemOrdering,
): Promise<Result.Type<void>> {
  const reorderWorkflowitemsResult = await Cache.withCache(conn, ctx, async (cache) =>
    WorkflowitemsReorder.setWorkflowitemOrdering(
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      ordering,
      {
        getSubproject: async (pId, spId) => cache.getSubproject(pId, spId),
      },
    ),
  );

  if (Result.isErr(reorderWorkflowitemsResult)) {
    return new VError(reorderWorkflowitemsResult, `reorder workflowitems failed`);
  }
  const newEvents = reorderWorkflowitemsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
