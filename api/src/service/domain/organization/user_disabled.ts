import Joi = require("joi");
import { VError } from "verror";

import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { UserMetadata, userMetadataSchema } from "../metadata";
import * as UserRecord from "../organization/user_record";

import { Identity } from "./identity";

type EventTypeType = "user_disabled";
const eventType: EventTypeType = "user_disabled";

interface InitialData {
  id: UserRecord.Id;
}

const initialDataSchema = Joi.object({
  id: UserRecord.idSchema.required(),
});

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  user: InitialData;
  metadata?: UserMetadata;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  user: initialDataSchema.required(),
  metadata: userMetadataSchema,
});

export function createEvent(
  source: string,
  publisher: Identity,
  user: InitialData,
  time: string = new Date().toISOString(),
  metadata?: UserMetadata,
): Result.Type<Event> {
  logger.trace("Creating user_disable event");

  const event = {
    type: eventType,
    source,
    publisher,
    time,
    user,
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
  if (event.type !== "user_disabled") {
    return new VError(`illegal event type: ${event.type}`);
  }

  // Disabling user
  user.permissions["user.authenticate"] = [];
}
