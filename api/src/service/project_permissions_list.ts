import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Permissions } from "./domain/permissions";
import * as Project from "./domain/workflow/project";
import * as ProjectPermissionsList from "./domain/workflow/project_permissions_list";

export async function getProjectPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Result.Type<Permissions>> {
  const projectPermissionsResult = await Cache.withCache(conn, ctx, async cache =>
    ProjectPermissionsList.getProjectPermissions(ctx, serviceUser, projectId, {
      getProject: async pId => {
        return cache.getProject(pId);
      },
    }),
  );
  if (Result.isErr(projectPermissionsResult)) {
    projectPermissionsResult.message = `could not fetch project permissions: ${projectPermissionsResult.message}`;
    return projectPermissionsResult;
  }

  return projectPermissionsResult;
}
