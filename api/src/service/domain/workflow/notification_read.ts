import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as Notification from "./notification";

type eventTypeType = "notification_read";
const eventType: eventTypeType = "notification_read";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  notificationId: Notification.Id;
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
  recipient: Joi.string().required(),
  notificationId: Notification.idSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  notificationId: Notification.Id,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    time,
    publisher,
    notificationId,
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
