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
import * as ProjectPermissionGranted from "./project_permission_granted";

interface Repository {
  getProject(projectId: Project.Id): Promise<Result.Type<Project.Project>>;
}

export async function grantProjectPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  grantee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  const project = await repository.getProject(projectId);

  if (Result.isErr(project)) {
    return new NotFound(ctx, "project", projectId);
  }

  // Create the new event:
  const permissionGranted = ProjectPermissionGranted.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    intent,
    grantee,
  );

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    if (!Project.permits(project, issuer, ["project.intent.grantPermission"])) {
      return new NotAuthorized(ctx, issuer.id, permissionGranted);
    }
  }

  // Check that the new event is indeed valid:
  const next = ProjectPermissionGranted.apply(ctx, permissionGranted, project);
  if (Result.isErr(next)) {
    return new InvalidCommand(ctx, permissionGranted, [next]);
  }

  return { newEvents: [permissionGranted] };
}
