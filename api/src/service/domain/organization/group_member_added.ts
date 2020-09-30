import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as Group from "./group";

type eventTypeType = "group_member_added";
const eventType: eventTypeType = "group_member_added";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  groupId: Group.Id;
  newMember: Group.Member;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string()
    .allow("")
    .required(),
  time: Joi.date()
    .iso()
    .required(),
  publisher: Joi.string().required(),
  groupId: Group.idSchema.required(),
  newMember: Group.memberSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  groupId: Group.Id,
  newMember: Group.Member,
  time: string = new Date().toISOString(),
): Result.Type<Event>  {
  const event = {
    type: eventType,
    source,
    publisher,
    groupId,
    newMember,
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
