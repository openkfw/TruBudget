import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemList from "./domain/workflow/workflowitem_list";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";
import * as SubprojectCacheHelper from "./subproject_cache_helper";

export async function listWorkflowitems(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: string,
  subprojectId: string,
): Promise<Result.Type<Workflowitem.ScrubbedWorkflowitem[]>> {
  logger.debug({ projectId, subprojectId }, "Getting all workflowitems");

  const workflowitemsResult = await WorkflowitemList.getAllVisible(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    {
      getWorkflowitems: async (pId, spId) => {
        return await WorkflowitemCacheHelper.getAllWorkflowitems(conn, ctx, pId, spId);
      },
      getWorkflowitemOrdering: async (pId, spId) => {
        const subproject = await SubprojectCacheHelper.getSubproject(conn, ctx, pId, spId);
        return Result.map(subproject, (x) => x.workflowitemOrdering);
      },
    },
  );

  return Result.mapErr(
    workflowitemsResult,
    (err) => new VError(err, "could not fetch workflowitems "),
  );
}
