import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";

type EventTypeType = "peerinfo_saved";
const eventType: EventTypeType = "peerinfo_saved";

export interface Event {
  type: EventTypeType;
  date: string;
  peers: unknown[];
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  date: Joi.string().required(),
  peers: Joi.array().items(Joi.object()),
}).options({ stripUnknown: true });

export function createEvent(
  _type: EventTypeType,
  date: string,
  peers: unknown[],
): Result.Type<Event> {
  logger.trace("Creating node logged event");
  const event = {
    type: eventType,
    date,
    peers,
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
