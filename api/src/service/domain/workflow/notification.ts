import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { Identity } from "../organization/identity";
import * as UserRecord from "../organization/user_record";

export type Id = string;

export const idSchema = Joi.string().max(36);

type eventTypeType = "notification";
const eventType: eventTypeType = "notification";

export interface Event {
  id: Id;
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  recipient: UserRecord.Id;
  businessEvent: BusinessEvent;
  projectId?: string;
  subprojectId?: string;
  workflowitemId?: string;
}

export const schema = Joi.object({
  id: idSchema.required(),
  type: Joi.valid(eventType).required(),
  source: Joi.string()
    .allow("")
    .required(),
  time: Joi.date()
    .iso()
    .required(),
  publisher: Joi.string().required(),
  recipient: Joi.string().required(),
  // "object" due to recursiveness of validation:
  businessEvent: Joi.object(),
  projectId: Joi.string().max(32),
  subprojectId: Joi.string().max(32),
  workflowitemId: Joi.string().max(32),
});

// TODO: can be removed (is in notification_created.ts)
export function createEvent(
  id: Id,
  source: string,
  publisher: Identity,
  recipient: string,
  businessEvent: BusinessEvent,
  projectId?: string,
  subprojectId?: string,
  workflowitemId?: string,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    id,
    type: eventType,
    source,
    time,
    publisher,
    recipient,
    businessEvent,
    projectId,
    subprojectId,
    workflowitemId,
  };
  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    throw new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input: any): Result.Type<Event> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}
