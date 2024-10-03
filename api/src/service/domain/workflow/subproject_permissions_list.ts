import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";

import * as Project from "./project";
import * as Subproject from "./subproject";

interface Repository {
  getSubproject(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Result.Type<Subproject.Subproject>>;
}

export async function getSubprojectPermissions(
  ctx: Ctx,
  user: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  repository: Repository,
): Promise<Result.Type<Permissions>> {
  logger.trace("Fetching subproject ...");

  const subprojectResult = await repository.getSubproject(projectId, subprojectId);

  if (Result.isErr(subprojectResult)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  const subproject: Subproject.Subproject = subprojectResult;

  logger.trace({ user }, "Checking user authorization");
  if (user.id !== "root") {
    const intent = "subproject.intent.listPermissions";
    if (!Subproject.permits(subproject, user, [intent])) {
      return new NotAuthorized({ ctx, userId: user.id, intent, target: subproject });
    }
  }
  return subproject.permissions;
}
