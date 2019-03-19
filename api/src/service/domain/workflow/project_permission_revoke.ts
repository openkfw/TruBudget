import { VError } from "verror";
import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import * as ProjectPermissionRevoked from "./project_permission_revoked";

interface Repository {
  getProject(projectId: Project.Id): Promise<Result.Type<Project.Project>>;
}

export async function revokeProjectPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  revokee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  const project = await repository.getProject(projectId);

  if (Result.isErr(project)) {
    return new NotFound(ctx, "project", projectId);
  }

  // Create the new event:
  const permissionRevoked = ProjectPermissionRevoked.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    intent,
    revokee,
  );

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    if (!Project.permits(project, issuer, ["project.intent.revokePermission"])) {
      return new NotAuthorized(ctx, issuer.id, permissionRevoked);
    }
  }

  // Check that the new event is indeed valid:
  const next = ProjectPermissionRevoked.apply(ctx, permissionRevoked, project);
  if (Result.isErr(next)) {
    return new InvalidCommand(ctx, permissionRevoked, [next]);
  }

  return { newEvents: [permissionRevoked] };
}
