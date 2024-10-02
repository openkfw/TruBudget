import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Permissions } from "./domain/permissions";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectPermissionsList from "./domain/workflow/subproject_permissions_list";
import * as SubprojectCacheHelper from "./subproject_cache_helper";

export async function listSubprojectPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
): Promise<Result.Type<Permissions>> {
  logger.debug({ projectId, subprojectId }, "Getting subproject permissions");

  const subprojectPermissionsResult = await SubprojectPermissionsList.getSubprojectPermissions(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    {
      getSubproject: async (pId, spId) => {
        return await SubprojectCacheHelper.getSubproject(conn, ctx, pId, spId);
      },
    },
  );
  return Result.mapErr(
    subprojectPermissionsResult,
    (err) => new VError(err, "list subprojects failed"),
  );
}
