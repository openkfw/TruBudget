import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";

const NETWORK_LOG = "network_log";

type EventTypeType = "peerinfo_saved";
const eventType: EventTypeType = "peerinfo_saved";

export interface Event {
  type: EventTypeType;
  date: string;
  peers: any[];
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  date: Joi.string().required(),
  peers: Joi.array().items(Joi.object()),
}).options({ stripUnknown: true });

export function createEvent(type: EventTypeType, date: string, peers: any[]): Result.Type<Event> {
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

export function validate(input: any): Result.Type<Event> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}
