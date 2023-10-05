import { VError } from "verror";
import Intent from "../../../authz/intents";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as GlobalPermissions from "./global_permissions";
import * as GlobalPermissionGranted from "./global_permission_granted";
import logger from "lib/logger";

interface Repository {
  getGlobalPermissions(): Promise<Result.Type<GlobalPermissions.GlobalPermissions>>;
  isGroup(granteeId): Promise<Result.Type<boolean>>;
  getUser(userId): Promise<Result.Type<UserRecord.UserRecord>>;
}

export async function grantGlobalPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  issuerOrganization: string,
  grantee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const globalPermissionGranted = GlobalPermissionGranted.createEvent(
    ctx.source,
    issuer.id,
    intent,
    grantee,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(globalPermissionGranted)) {
    return new VError(globalPermissionGranted, "failed to create global permission granted event");
  }

  const grantIntent = "global.grantPermission";
  const globalPermissionsResult = await repository.getGlobalPermissions();

  if (Result.isErr(globalPermissionsResult)) {
    return new VError(globalPermissionsResult, "get global permissions failed");
  }
  const currentGlobalPermissions = globalPermissionsResult;

  logger.trace({ grantee }, "Checking if grantee is a group");
  const isGroupResult = await repository.isGroup(grantee);
  if (Result.isErr(isGroupResult)) {
    return new VError(isGroupResult, "isGroup check failed");
  }
  const isGroup = isGroupResult;

  // If grantee is group, return an error because global permissions cannot be granted to groups
  if (isGroup) {
    return new PreconditionError(
      ctx,
      globalPermissionGranted,
      "Cannot assign global permissions to groups",
    );
  }

  const userResult = await repository.getUser(grantee);
  if (Result.isErr(userResult)) {
    return new PreconditionError(ctx, globalPermissionGranted, userResult.message);
  }

  logger.trace(
    { grantee, organization: issuerOrganization },
    "Checking if grantee and user belong to the same organization",
  );
  if (userResult.organization !== issuerOrganization) {
    return new NotAuthorized({
      ctx,
      userId: issuer.id,
      intent: grantIntent,
      target: currentGlobalPermissions,
      isOtherOrganization: true,
    });
  }

  logger.trace({ issuer }, "Checking if issuer is authorized");
  if (issuer.id !== "root") {
    if (!GlobalPermissions.permits(currentGlobalPermissions, issuer, [grantIntent])) {
      return new NotAuthorized({
        ctx,
        userId: issuer.id,
        intent: grantIntent,
        target: currentGlobalPermissions,
      });
    }
  }

  return [globalPermissionGranted];
}
