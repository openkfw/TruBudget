import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import Intent, { userIntents } from "../../../authz/intents";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as UserRecord from "./user_record";
import { UserMetadata, userMetadataSchema } from "../metadata";

type EventTypeType = "user_permission_revoked";
const eventType: EventTypeType = "user_permission_revoked";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  userId: UserRecord.Id;
  permission: Intent;
  revokee: Identity;
  metadata?: UserMetadata;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  userId: UserRecord.idSchema.required(),
  permission: Joi.valid(...userIntents).required(),
  revokee: Joi.string().required(),
  metadata: userMetadataSchema,
});

export function createEvent(
  source: string,
  publisher: Identity,
  userId: UserRecord.Id,
  permission: Intent,
  revokee: Identity,
  time: string = new Date().toISOString(),
  metadata?: UserMetadata,
): Result.Type<Event> {
  logger.trace("Creating user_permission_revoked event");

  const event = {
    type: eventType,
    source,
    publisher,
    time,
    userId,
    permission,
    revokee,
    metadata,
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
  if (event.type !== "user_permission_revoked") {
    return new VError(`illegal event type: ${event.type}`);
  }

  const eligibleIdentities = user.permissions[event.permission];
  if (eligibleIdentities === undefined) {
    // Nothing to do here..
    return;
  }

  const foundIndex = eligibleIdentities.indexOf(event.revokee);
  const hasPermission = foundIndex !== -1;
  if (hasPermission) {
    // Remove the user from the array:
    eligibleIdentities.splice(foundIndex, 1);
  }
}
