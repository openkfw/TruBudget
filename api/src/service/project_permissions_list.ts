import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Permissions } from "./domain/permissions";
import * as Project from "./domain/workflow/project";
import * as ProjectGet from "./domain/workflow/project_get";

export async function getProjectPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Result.Type<Permissions>> {
  // TODO This should be modeled on the domain layer, similar to global_permissions_get.
  // TODO There, authorization for project.intent.listPermissions should be checked.
  const projectResult = await Cache.withCache(conn, ctx, async cache =>
    ProjectGet.getProject(ctx, serviceUser, projectId, {
      getProjectEvents: async () => {
        return cache.getProjectEvents(projectId);
      },
    }),
  );

  if (Result.isErr(projectResult)) {
    projectResult.message = `could not fetch project permissions: ${projectResult.message}`;
    return projectResult;
  }

  return projectResult.permissions;
}
