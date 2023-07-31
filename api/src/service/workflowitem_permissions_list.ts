import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Permissions } from "./domain/permissions";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemPermissionsList from "./domain/workflow/workflowitem_permissions_list";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";
export { RequestData } from "./domain/workflow/project_create";

export async function listWorkflowitemPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
): Promise<Result.Type<Permissions>> {
  logger.debug({ projectId, subprojectId, workflowitemId }, "Getting workflowitem permissions");

  const permissionsResult = await WorkflowitemPermissionsList.getAll(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    workflowitemId,
    {
      getWorkflowitem: async (pId, spId, wId) => {
        return await WorkflowitemCacheHelper.getWorkflowitem(conn, ctx, pId, wId);
      },
    },
  );

  return Result.mapErr(
    permissionsResult,
    (err) => new VError(err, `could not fetch permissions of ${workflowitemId} `),
  );
}
