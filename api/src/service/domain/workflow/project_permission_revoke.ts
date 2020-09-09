import isEqual = require("lodash.isequal");
import { VError } from "verror";
import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import * as ProjectEventSourcing from "./project_eventsourcing";
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
): Promise<Result.Type<BusinessEvent[]>> {
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
  if (Result.isErr(permissionRevoked)) {
    return new VError(permissionRevoked, "failed to create permission revoked event");
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const revokeIntent = "project.intent.revokePermission";
    if (!Project.permits(project, issuer, [revokeIntent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent: revokeIntent, target: project });
    }
  }

  // Check that the new event is indeed valid:
  const updatedProject = ProjectEventSourcing.newProjectFromEvent(ctx, project, permissionRevoked);
  if (Result.isErr(updatedProject)) {
    return new InvalidCommand(ctx, permissionRevoked, [updatedProject]);
  }

  // Prevent revoking grant permission of last user
  const intents: Intent[] = ["project.intent.grantPermission"];
  if (
    intents.includes(intent) &&
    project.permissions[`${intent}`] !== undefined &&
    project.permissions[`${intent}`].length === 1
  ) {
    return new PreconditionError(
      ctx,
      permissionRevoked,
      `Revoking ${intent} of last user is not allowed.`,
    );
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(project.permissions, updatedProject.permissions)) {
    return [];
  } else {
    return [permissionRevoked];
  }
}
