import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemGet from "./domain/workflow/workflowitem_get";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";

export async function getWorkflowitem(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
): Promise<Result.Type<Workflowitem.Workflowitem>> {
  logger.debug({ projectId, subprojectId, workflowitemId }, "Getting workflowitem");

  const workflowitemResult = await WorkflowitemGet.getWorkflowitem(
    ctx,
    serviceUser,
    workflowitemId,
    {
      getWorkflowitem: async () => {
        return await WorkflowitemCacheHelper.getWorkflowitem(conn, ctx, projectId, workflowitemId);
      },
    },
  );

  return Result.mapErr(
    workflowitemResult,
    (err) => new VError(err, `could not fetch workflowitem ${workflowitemId}`),
  );
}
