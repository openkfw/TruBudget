import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Permissions } from "./domain/permissions";
import * as Project from "./domain/workflow/project";
import * as ProjectPermissionsList from "./domain/workflow/project_permissions_list";
import * as ProjectCacheHelper from "./project_cache_helper";

export async function getProjectPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Result.Type<Permissions>> {
  logger.debug({ projectId }, "Get project permissions");

  const projectPermissionsResult = await ProjectPermissionsList.getProjectPermissions(
    ctx,
    serviceUser,
    projectId,
    {
      getProject: async (pId) => {
        return await ProjectCacheHelper.getProject(conn, ctx, pId);
      },
    },
  );

  if (Result.isErr(projectPermissionsResult)) {
    projectPermissionsResult.message = `could not fetch project permissions: ${projectPermissionsResult.message}`;
    return projectPermissionsResult;
  }

  return projectPermissionsResult;
}
