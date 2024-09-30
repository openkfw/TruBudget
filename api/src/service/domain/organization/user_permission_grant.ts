import isEqual = require("lodash.isequal");
import { VError } from "verror";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";

import { Identity } from "./identity";
import { ServiceUser } from "./service_user";
import * as UserEventSourcing from "./user_eventsourcing";
import * as UserPermissionGranted from "./user_permission_granted";
import * as UserRecord from "./user_record";

interface Repository {
  getTargetUser(userId: UserRecord.Id): Promise<Result.Type<UserRecord.UserRecord>>;
}

export async function grantUserPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  issuerOrganization: string,
  userId: UserRecord.Id,
  grantee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const user = await repository.getTargetUser(userId);

  if (Result.isErr(user)) {
    return new NotFound(ctx, "user", userId);
  }

  const permissionGranted = UserPermissionGranted.createEvent(
    ctx.source,
    issuer.id,
    userId,
    intent,
    grantee,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(permissionGranted)) {
    return new VError(permissionGranted, "failed to create user permission granted event");
  }

  logger.trace({ issuer }, "Checking if issuer and target belong to the same organization");

  if (user.organization !== issuerOrganization) {
    return new NotAuthorized({
      ctx,
      userId: issuer.id,
      intent,
      isOtherOrganization: true,
    });
  }

  logger.trace({ issuer }, "Checking if user has permissions");
  if (issuer.id !== "root") {
    const grantIntent: Intent = "user.intent.grantPermission";
    if (!UserRecord.permits(user, issuer, [grantIntent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent: grantIntent, target: user });
    }
  }

  logger.trace({ event: permissionGranted }, "Checking validity of event");
  const updatedUser = UserEventSourcing.newUserFromEvent(ctx, user, permissionGranted);
  if (Result.isErr(updatedUser)) {
    return new InvalidCommand(ctx, permissionGranted, [updatedUser]);
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(user.permissions, updatedUser.permissions)) {
    return [];
  }

  return [permissionGranted];
}
