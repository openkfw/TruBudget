import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import Intent, { userIntents } from "../../../authz/intents";
import * as Result from "../../../result";
import { Identity } from "./identity";
import * as UserRecord from "./user_record";

type EventTypeType = "user_permission_granted";
const eventType: EventTypeType = "user_permission_granted";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  userId: UserRecord.Id;
  permission: Intent;
  grantee: Identity;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  userId: UserRecord.idSchema.required(),
  permission: Joi.valid(...userIntents).required(),
  grantee: Joi.string().required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  userId: UserRecord.Id,
  permission: Intent,
  grantee: Identity,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace("Creating user_permission_granted event");

  const event = {
    type: eventType,
    source,
    publisher,
    time,
    userId,
    permission,
    grantee,
  };
  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    return new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input): Result.Type<Event> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}

/**
 * Applies the event to the given user, or returns an error.
 *
 * When an error is returned (or thrown), any already applied modifications are
 * discarded.
 *
 * This function is not expected to validate its changes; instead, the modified user
 * is automatically validated when obtained using
 * `user_eventsourcing.ts`:`newUserFromEvent`.
 */
export function mutate(user: UserRecord.UserRecord, event: Event): Result.Type<void> {
  if (event.type !== "user_permission_granted") {
    return new VError(`illegal event type: ${event.type}`);
  }

  const eligibleIdentities = user.permissions[event.permission] || [];
  if (!eligibleIdentities.includes(event.grantee)) {
    eligibleIdentities.push(event.grantee);
  }

  user.permissions[event.permission] = eligibleIdentities;
}
