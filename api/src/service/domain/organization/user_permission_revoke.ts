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
import * as UserEventSourcing from "./user_eventsourcing";
import * as UserPermissionRevoked from "./user_permission_revoked";
import * as UserRecord from "./user_record";

interface Repository {
  getTargetUser(userId: UserRecord.Id): Promise<Result.Type<UserRecord.UserRecord>>;
}

export async function revokeUserPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  userId: UserRecord.Id,
  revokee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const user = await repository.getTargetUser(userId);

  if (Result.isErr(user)) {
    return new NotFound(ctx, "user", userId);
  }

  // Create the new event:
  const permissionRevoked = UserPermissionRevoked.createEvent(
    ctx.source,
    issuer.id,
    userId,
    intent,
    revokee,
  );
  if (Result.isErr(permissionRevoked)) {
    return new VError(permissionRevoked, "failed to create permission revoked event");
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const revokeIntent = "user.intent.revokePermission";
    if (!UserRecord.permits(user, issuer, [revokeIntent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent: revokeIntent, target: user });
    }
  }

  // Check that the new event is indeed valid:
  const updatedUser = UserEventSourcing.newUserFromEvent(ctx, user, permissionRevoked);
  if (Result.isErr(updatedUser)) {
    return new InvalidCommand(ctx, permissionRevoked, [updatedUser]);
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(user.permissions, updatedUser.permissions)) {
    return [];
  } else {
    return [permissionRevoked];
  }
}
