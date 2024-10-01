import { VError } from "verror";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";

import * as GlobalPermissionRevoked from "./global_permission_revoked";
import * as GlobalPermissions from "./global_permissions";

interface Repository {
  getGlobalPermissions(): Promise<Result.Type<GlobalPermissions.GlobalPermissions>>;
  isGroup(revokeeId): Promise<Result.Type<boolean>>;
  getUser(userId): Promise<Result.Type<UserRecord.UserRecord>>;
}

export async function revokeGlobalPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  issuerOrganization: string,
  revokee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  // Create the new event:
  const globalPermissionRevoked = GlobalPermissionRevoked.createEvent(
    ctx.source,
    issuer.id,
    intent,
    revokee,
    new Date().toISOString(),
    issuer.metadata,
  );

  if (Result.isErr(globalPermissionRevoked)) {
    return new VError(globalPermissionRevoked, "failed to create global permission revoked event");
  }

  const revokeIntent = "global.revokePermission";
  const currentGlobalPermissionsResult = await repository.getGlobalPermissions();
  if (Result.isErr(currentGlobalPermissionsResult)) {
    return new VError(currentGlobalPermissionsResult, "get global permissions failed");
  }
  const currentGlobalPermissions = currentGlobalPermissionsResult;

  const isGroupResult = await repository.isGroup(revokee);
  if (Result.isErr(isGroupResult)) {
    return new VError(isGroupResult, "isGroup check failed");
  }
  const isGroup = isGroupResult;

  logger.trace({ revokee }, "Checking if revokee is a group");
  if (isGroup) {
    return new PreconditionError(
      ctx,
      globalPermissionRevoked,
      "Cannot assign global permissions to groups",
    );
  }

  // If the revokee is not a group, he/she is a user
  const userResult = await repository.getUser(revokee);
  if (Result.isErr(userResult)) {
    return new PreconditionError(ctx, globalPermissionRevoked, userResult.message);
  }

  logger.trace(
    { revokee: userResult, organization: issuerOrganization },
    "Checking if revokee and issuer belong to the same organization",
  );
  if (userResult.organization !== issuerOrganization) {
    return new NotAuthorized({
      ctx,
      userId: issuer.id,
      intent: revokeIntent,
      target: currentGlobalPermissions,
      isOtherOrganization: true,
    });
  }

  logger.trace({ issuer }, "Checking if user is root");
  if (issuer.id !== "root") {
    if (!GlobalPermissions.permits(currentGlobalPermissions, issuer, [revokeIntent])) {
      return new NotAuthorized({
        ctx,
        userId: issuer.id,
        intent: revokeIntent,
        target: currentGlobalPermissions,
      });
    }
  }

  return [globalPermissionRevoked];
}
