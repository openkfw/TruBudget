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
import * as Subproject from "./subproject";
import * as SubprojectEventSourcing from "./subproject_eventsourcing";
import * as SubprojectPermissionRevoked from "./subproject_permission_revoked";

interface Repository {
  getSubproject(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Result.Type<Subproject.Subproject>>;
}

export async function revokeSubprojectPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  revokee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const subproject = await repository.getSubproject(projectId, subprojectId);

  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  // Create the new event:
  const permissionRevoked = SubprojectPermissionRevoked.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    intent,
    revokee,
  );
  if (Result.isErr(permissionRevoked)) {
    return new VError(permissionRevoked, "failed to create permission revoked event");
  }
  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const revokeIntent = "subproject.intent.revokePermission";
    if (!Subproject.permits(subproject, issuer, [revokeIntent])) {
      return new NotAuthorized({
        ctx,
        userId: issuer.id,
        intent: revokeIntent,
        target: subproject,
      });
    }
  }

  // Check that the new event is indeed valid:
  const updatedSubproject = SubprojectEventSourcing.newSubprojectFromEvent(
    ctx,
    subproject,
    permissionRevoked,
  );
  if (Result.isErr(updatedSubproject)) {
    return new InvalidCommand(ctx, permissionRevoked, [updatedSubproject]);
  }

  // Prevent revoking grant permission of last user
  const intents: Intent[] = ["subproject.intent.grantPermission"];
  if (
    intents.includes(intent) &&
    subproject.permissions[`${intent}`] !== undefined &&
    subproject.permissions[`${intent}`].length === 1
  ) {
    return new PreconditionError(
      ctx,
      permissionRevoked,
      `Revoking ${intent} of last user is not allowed.`,
    );
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(subproject.permissions, updatedSubproject.permissions)) {
    return [];
  } else {
    return [permissionRevoked];
  }
}
