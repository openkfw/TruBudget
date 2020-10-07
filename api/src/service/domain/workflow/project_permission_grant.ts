import isEqual = require("lodash.isequal");
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
import * as ProjectEventSourcing from "./project_eventsourcing";
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
): Promise<Result.Type<BusinessEvent[]>> {
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
  if (Result.isErr(permissionGranted)) {
    return new VError(permissionGranted, "failed to create permission granted event");
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const grantIntent = "project.intent.grantPermission";
    if (!Project.permits(project, issuer, [grantIntent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent: grantIntent, target: project });
    }
  }

  // Check that the new event is indeed valid:
  const updatedProject = ProjectEventSourcing.newProjectFromEvent(ctx, project, permissionGranted);
  if (Result.isErr(updatedProject)) {
    return new InvalidCommand(ctx, permissionGranted, [updatedProject]);
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(project.permissions, updatedProject.permissions)) {
    return [];
  } else {
    return [permissionGranted];
  }
}
