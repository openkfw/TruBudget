import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Permissions } from "./domain/permissions";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectPermissionsList from "./domain/workflow/subproject_permissions_list";

export async function listSubprojectPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
): Promise<Result.Type<Permissions>> {
  const subprojectPermissionsResult = await Cache.withCache(conn, ctx, async cache =>
    SubprojectPermissionsList.getSubprojectPermissions(ctx, serviceUser, projectId, subprojectId, {
      getSubproject: async (pId, spId) => {
        return cache.getSubproject(pId, spId);
      },
    }),
  );
  if (Result.isErr(subprojectPermissionsResult)) {
    subprojectPermissionsResult.message = `could not fetch subproject permissions: ${
      subprojectPermissionsResult.message
    }`;
    return subprojectPermissionsResult;
  }

  return subprojectPermissionsResult;
}
