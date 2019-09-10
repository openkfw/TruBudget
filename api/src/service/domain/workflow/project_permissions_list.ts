import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as Project from "./project";

interface Repository {
  getProject(projectId: Project.Id): Promise<Result.Type<Project.Project>>;
}

export async function getProjectPermissions(
  ctx: Ctx,
  user: ServiceUser,
  projectId: Project.Id,
  repository: Repository,
): Promise<Result.Type<Permissions>> {
  const projectResult = await repository.getProject(projectId);

  if (Result.isErr(projectResult)) {
    return new NotFound(ctx, "project", projectId);
  }

  const project: Project.Project = projectResult;

  if (user.id !== "root") {
    const intent = "project.intent.listPermissions";
    if (!Project.permits(project, user, [intent])) {
      return new NotAuthorized({ ctx, userId: user.id, intent, target: project });
    }
  }
  return project.permissions;
}
