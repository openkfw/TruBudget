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
import * as Subproject from "./subproject";
import * as SubprojectEventSourcing from "./subproject_eventsourcing";
import * as SubprojectPermissionGranted from "./subproject_permission_granted";

interface Repository {
  getSubproject(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Result.Type<Subproject.Subproject>>;
}

export async function grantSubprojectPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  grantee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const subproject = await repository.getSubproject(projectId, subprojectId);

  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  // Create the new event:
  const permissionGranted = SubprojectPermissionGranted.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    intent,
    grantee,
  );
  if (Result.isErr(permissionGranted)) {
    return new VError(permissionGranted, "failed to create permission granted event");
  }
  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const grantIntent = "subproject.intent.grantPermission";
    if (!Subproject.permits(subproject, issuer, [grantIntent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent: grantIntent, target: subproject });
    }
  }

  // Check that the new event is indeed valid:
  const updatedSubproject = SubprojectEventSourcing.newSubprojectFromEvent(
    ctx,
    subproject,
    permissionGranted,
  );
  if (Result.isErr(updatedSubproject)) {
    return new InvalidCommand(ctx, permissionGranted, [updatedSubproject]);
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(subproject.permissions, updatedSubproject.permissions)) {
    return [];
  } else {
    return [permissionGranted];
  }
}
