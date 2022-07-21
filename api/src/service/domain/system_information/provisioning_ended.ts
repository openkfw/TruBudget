import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";

type EventTypeType = "provisioning_ended";
const eventType: EventTypeType = "provisioning_ended";

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
  logger.trace("Creating provisioning_end event");
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

export function validate(input): Result.Type<Event> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}
