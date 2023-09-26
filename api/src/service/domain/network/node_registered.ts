import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import { UserMetadata, userMetadataSchema } from "../metadata";

type EventTypeType = "node_registered";
const eventType: EventTypeType = "node_registered";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  address: string;
  organization: string;
  metadata?: UserMetadata;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  address: Joi.string().required(),
  organization: Joi.string().required(),
  metadata: userMetadataSchema,
}).options({ stripUnknown: true });

export function createEvent(
  source: string,
  publisher: Identity,
  address: string,
  organization: string,
  time: string = new Date().toISOString(),
  metadata?: UserMetadata,
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    address,
    organization,
    time,
    metadata,
  };
  logger.trace("Creating node registered event");

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
