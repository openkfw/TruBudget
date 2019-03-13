import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Permissions } from "./domain/permissions";
import * as Project from "./domain/workflow/project";
import * as ProjectGet from "./domain/workflow/project_get";
import { loadProjectEvents } from "./load";

export async function getProjectPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Result.Type<Permissions>> {
  // TODO This should be modeled on the domain layer, similar to global_permissions_get.
  // TODO There, authorization for project.intent.listPermissions should be checked.
  const projectResult = await ProjectGet.getProject(ctx, serviceUser, projectId, {
    getProjectEvents: async () => loadProjectEvents(conn, projectId),
  });

  if (Result.isErr(projectResult)) {
    projectResult.message = `could not fetch project permissions: ${projectResult.message}`;
    return projectResult;
  }

  return projectResult.permissions;
}
