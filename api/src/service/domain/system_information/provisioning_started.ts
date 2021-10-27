import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";

type EventTypeType = "provisioning_started";
const eventType: EventTypeType = "provisioning_started";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace("Creating provisioning_start event");

  const event = {
    type: eventType,
    source,
    time,
    publisher,
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
