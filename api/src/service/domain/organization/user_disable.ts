import Joi = require("joi");
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import * as GlobalPermissions from "../workflow/global_permissions";
import * as UserAssignments from "../workflow/user_assignments";
import * as UserAssignmentsGet from "../workflow/user_assignments_get";
import { ServiceUser } from "./service_user";
import * as UserDisabled from "./user_disabled";
import * as UserEventSourcing from "./user_eventsourcing";
import * as UserRecord from "./user_record";
import isEqual = require("lodash.isequal");

export interface RequestData {
  userId: string;
}

const requestDataSchema = Joi.object({
  userId: UserRecord.idSchema.required(),
});

export function validate(input): Result.Type<RequestData> {
  const { value, error } = requestDataSchema.validate(input);
  return !error ? value : error;
}

interface Repository {
  getUser(userId: string): Promise<Result.Type<UserRecord.UserRecord>>;
  getGlobalPermissions(): Promise<Result.Type<GlobalPermissions.GlobalPermissions>>;
  getUserAssignments(userId: string): Promise<Result.Type<UserAssignments.UserAssignments>>;
}

export async function disableUser(
  ctx: Ctx,
  issuer: ServiceUser,
  issuerOrganization: string,
  data: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const source = ctx.source;
  const publisher = issuer.id;
  const validationResult = validate(data);
  const intent: Intent = "global.disableUser";
  const userToDisable = data.userId;

  const globalPermissionsResult = await repository.getGlobalPermissions();
  if (Result.isErr(globalPermissionsResult)) {
    return new VError(globalPermissionsResult, "get global permissions failed");
  }
  const globalPermissions = globalPermissionsResult;

  // Create the new event:
  const userDisabled = UserDisabled.createEvent(source, publisher, {
    id: userToDisable,
  });
  if (Result.isErr(userDisabled)) {
    return new VError(userDisabled, "failed to create user disabled event");
  }

  if (Result.isErr(validationResult)) {
    return new PreconditionError(ctx, userDisabled, validationResult.message);
  }

  const userResult = await repository.getUser(userToDisable);
  if (Result.isErr(userResult)) {
    return new PreconditionError(ctx, userDisabled, "Error getting user");
  }
  const user = userResult;

  // Check if revokee and issuer belong to the same organization
  if (userResult.organization !== issuerOrganization) {
    logger.trace({ issuer }, "User does not belong to the right organization");
    return new NotAuthorized({
      ctx,
      userId: issuer.id,
      intent,
      target: globalPermissions,
      isOtherOrganization: true,
    });
  }

  logger.trace({ issuer }, "Checking if user is root or has permissions");
  if (issuer.id !== "root") {
    const isAuthorized = GlobalPermissions.permits(globalPermissions, issuer, [intent]);
    if (!isAuthorized) {
      return new NotAuthorized({
        ctx,
        userId: issuer.id,
        intent,
        target: globalPermissions,
      });
    }
  }

  if (issuer.id === userResult.id) {
    return new PreconditionError(ctx, userDisabled, "Error - You cannot disable yourself");
  }

  const assignments: Result.Type<UserAssignments.UserAssignments> =
    await repository.getUserAssignments(userToDisable);
  if (Result.isErr(assignments)) {
    return new VError(assignments, "failed to get assignments");
  }
  if (UserAssignmentsGet.hasAssignments(assignments)) {
    return new PreconditionError(
      ctx,
      userDisabled,
      `Error - This user is still assigned to: ${UserAssignmentsGet.toString(assignments)}`,
    );
  }

  const updatedUser = UserEventSourcing.newUserFromEvent(ctx, user, userDisabled);
  if (Result.isErr(updatedUser)) {
    return new InvalidCommand(ctx, userDisabled, [updatedUser]);
  }
  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(user.permissions, updatedUser.permissions)) {
    return [];
  } else {
    return [userDisabled];
  }
}
