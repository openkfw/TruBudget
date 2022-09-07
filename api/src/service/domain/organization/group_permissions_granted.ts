import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import Intent, { groupIntents } from "../../../authz/intents";
import * as Result from "../../../result";
import * as Group from "./group";
import { Identity } from "./identity";

type EventTypeType = "group_permissions_granted";
const eventType: EventTypeType = "group_permissions_granted";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  groupId: Group.Id;
  permission: Intent;
  grantee: Identity;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  groupId: Group.idSchema.required(),
  permission: Joi.valid(...groupIntents).required(),
  grantee: Joi.string().required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  groupId: Group.Id,
  permission: Intent,
  grantee: Identity,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    time,
    groupId,
    permission,
    grantee,
  };

  logger.trace({ event }, "Checking validity of event");
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
