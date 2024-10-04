import Joi = require("joi");
import { VError } from "verror";

import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { UserMetadata, userMetadataSchema } from "../metadata";
import { Identity } from "../organization/identity";

import * as Group from "./group";

type EventTypeType = "group_member_added";
const eventType: EventTypeType = "group_member_added";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  groupId: Group.Id;
  newMembers: Group.Member[];
  metadata?: UserMetadata;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  groupId: Group.idSchema.required(),
  newMembers: Joi.array().items(Group.memberSchema.required()).required(),
  metadata: userMetadataSchema,
});

export function createEvent(
  source: string,
  publisher: Identity,
  groupId: Group.Id,
  newMembers: Group.Member[],
  time: string = new Date().toISOString(),
  metadata?: UserMetadata,
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    groupId,
    newMembers,
    time,
    metadata,
  };
  logger.trace("Creating group_member_add event...");

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
