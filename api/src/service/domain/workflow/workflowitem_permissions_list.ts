import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";

import * as Project from "./project";
import * as Subroject from "./subproject";
import * as Workflowitem from "./workflowitem";

interface Repository {
  getWorkflowitem(
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem>>;
}

export async function getAll(
  ctx: Ctx,
  user: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subroject.Id,
  workflowitemId: Workflowitem.Id,
  repository: Repository,
): Promise<Result.Type<Permissions>> {
  const result = await repository.getWorkflowitem(projectId, subprojectId, workflowitemId);

  if (Result.isErr(result)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }
  const workflowitem: Workflowitem.Workflowitem = result;

  logger.trace({ user }, "Checking user authorization");
  if (user.id !== "root") {
    const intent = "workflowitem.intent.listPermissions";
    if (!Workflowitem.permits(workflowitem, user, [intent])) {
      return new NotAuthorized({ ctx, userId: user.id, intent, target: workflowitem });
    }
  }

  return workflowitem.permissions;
}
