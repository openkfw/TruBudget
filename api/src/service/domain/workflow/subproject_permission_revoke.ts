import isEqual = require("lodash.isequal");

import { VError } from "verror";
import Intent from "../../../authz/intents";
import { Ctx } from "lib/ctx";
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
import logger from "lib/logger";

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

  logger.trace(
    { issuer, revokee, intent, projectId, subprojectId },
    "Creating subproject_permission_revoked event",
  );
  const permissionRevoked = SubprojectPermissionRevoked.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    intent,
    revokee,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(permissionRevoked)) {
    return new VError(permissionRevoked, "failed to create permission revoked event");
  }

  logger.trace({ issuer }, "Checking if user has permissions");
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

  logger.trace({ event: permissionRevoked }, "Checking event validity");
  const updatedSubproject = SubprojectEventSourcing.newSubprojectFromEvent(
    ctx,
    subproject,
    permissionRevoked,
  );
  if (Result.isErr(updatedSubproject)) {
    return new InvalidCommand(ctx, permissionRevoked, [updatedSubproject]);
  }

  logger.trace("Prevent revoke grant permission on last user");
  const intents: Intent[] = ["subproject.intent.grantPermission"];
  if (intent && intents.includes(intent) && subproject?.permissions[intent]?.length === 1) {
    return new PreconditionError(
      ctx,
      permissionRevoked,
      `Revoking ${intent} of last user is not allowed.`,
    );
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(subproject.permissions, updatedSubproject.permissions)) {
    return [];
  }

  return [permissionRevoked];
}
