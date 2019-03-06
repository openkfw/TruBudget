import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import { sourceProjects } from "./project_eventsourcing";
import * as ProjectPermissionRevoked from "./project_permission_revoked";

interface Repository {
  getProjectEvents(): Promise<BusinessEvent[]>;
}

export async function revokeProjectPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  revokee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
  const projectEvents = await repository.getProjectEvents();
  const { projects } = sourceProjects(ctx, projectEvents);

  const project = projects.find(x => x.id === projectId);
  if (project === undefined) {
    return { newEvents: [], errors: [new NotFound(ctx, "project", projectId)] };
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
      return {
        newEvents: [],
        errors: [new NotAuthorized(ctx, issuer.id, permissionRevoked)],
      };
    }
  }

  // Check that the new event is indeed valid:
  const { errors } = sourceProjects(ctx, projectEvents.concat([permissionRevoked]));
  if (errors.length > 0) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, permissionRevoked, errors)] };
  }

  return { newEvents: [permissionRevoked], errors: [] };
}
