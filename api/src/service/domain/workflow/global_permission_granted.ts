import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import Intent, { globalIntents } from "../../../authz/intents";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";

type EventTypeType = "global_permission_granted";
const eventType: EventTypeType = "global_permission_granted";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  permission: Intent;
  grantee: Identity;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  permission: Joi.valid(...globalIntents).required(),
  grantee: Joi.string().required(),
}).options({ stripUnknown: true });

export function createEvent(
  source: string,
  publisher: Identity,
  permission: Intent,
  grantee: Identity,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace({ grantee, permission }, "Creating global permission granted event");
  const event = {
    type: eventType,
    source,
    publisher,
    time,
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
