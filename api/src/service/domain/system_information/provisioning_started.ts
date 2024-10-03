import Joi = require("joi");
import { VError } from "verror";

import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { UserMetadata, userMetadataSchema } from "../metadata";
import { Identity } from "../organization/identity";

type EventTypeType = "provisioning_started";
const eventType: EventTypeType = "provisioning_started";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  metadata?: UserMetadata;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  metadata: userMetadataSchema,
});

export function createEvent(
  source: string,
  publisher: Identity,
  time: string = new Date().toISOString(),
  metadata?: UserMetadata,
): Result.Type<Event> {
  logger.trace("Creating provisioning_start event");

  const event = {
    type: eventType,
    source,
    time,
    publisher,
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
