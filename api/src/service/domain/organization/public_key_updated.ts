import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "./identity";

type EventTypeType = "public_key_updated";
const eventType: EventTypeType = "public_key_updated";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  organization: string;
  publicKey: string;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  organization: Joi.string().required(),
  publicKey: Joi.string().required(),
}).options({ stripUnknown: true });

export function createEvent(
  source: string,
  publisher: Identity,
  organization: string,
  publicKey: string,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace("Creating public_key_update event...");

  const event = {
    type: eventType,
    source,
    publisher,
    organization,
    publicKey,
    time,
  };
  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    return new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input: any): Result.Type<Event> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}
