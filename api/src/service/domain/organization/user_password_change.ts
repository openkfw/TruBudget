import Joi = require("joi");

import { VError } from "verror";
import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "./service_user";
import * as UserEventSourcing from "./user_eventsourcing";
import * as UserPasswordChanged from "./user_password_changed";
import * as UserRecord from "./user_record";

export interface RequestData {
  userId: string;
  newPassword: string;
}

const requestDataSchema = Joi.object({
  userId: UserRecord.idSchema.required(),
  newPassword: Joi.string()
    .min(8)
    .regex(/[a-zA-z]/)
    .regex(/[0-9]/)
    .required(),
});

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  getUser(userId: string): Promise<Result.Type<UserRecord.UserRecord>>;
  hash(plaintext: string): Promise<string>;
}

export async function changeUserPassword(
  ctx: Ctx,
  issuer: ServiceUser,
  issuerOrganization: string,
  data: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const source = ctx.source;
  const publisher = issuer.id;
  const validationResult = validate(data);
  const intent: Intent = "user.changePassword";
  const passwordChanged = UserPasswordChanged.createEvent(source, publisher, {
    id: data.userId,
    passwordHash: await repository.hash(data.newPassword),
  });
  if (Result.isErr(passwordChanged)) {
    return new VError(passwordChanged, "failed to create user password changed event");
  }
  if (Result.isErr(validationResult)) {
    return new PreconditionError(ctx, passwordChanged, validationResult.message);
  }

  const userResult = await repository.getUser(data.userId);
  if (Result.isErr(userResult)) {
    return new PreconditionError(ctx, passwordChanged, "Error getting user");
  }
  const user = userResult;

  // Check if revokee and issuer belong to the same organization
  if (userResult.organization !== issuerOrganization) {
    return new NotAuthorized({ ctx, userId: issuer.id, intent });
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const isAuthorized = UserRecord.permits(user, issuer, [intent]);
    if (!isAuthorized) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent });
    }
  }

  const result = UserEventSourcing.newUserFromEvent(ctx, user, passwordChanged);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, passwordChanged, [result]);
  }

  return [passwordChanged];
}
