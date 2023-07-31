import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as WorkflowitemsReorder from "./domain/workflow/workflowitems_reorder";
import { WorkflowitemOrdering } from "./domain/workflow/workflowitem_ordering";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import { store } from "./store";

export async function setWorkflowitemOrdering(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  ordering: WorkflowitemOrdering,
): Promise<Result.Type<void>> {
  logger.debug({ ordering, projectId, subprojectId }, "Setting workflowitem ordering");

  const reorderWorkflowitemsResult = await WorkflowitemsReorder.setWorkflowitemOrdering(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    ordering,
    {
      getSubproject: async (pId, spId) => {
        return await SubprojectCacheHelper.getSubproject(conn, ctx, pId, spId);
      },
    },
  );

  if (Result.isErr(reorderWorkflowitemsResult)) {
    return new VError(reorderWorkflowitemsResult, "reorder workflowitems failed");
  }
  const newEvents = reorderWorkflowitemsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }
}
