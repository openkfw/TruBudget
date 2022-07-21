import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as UserRecord from "../organization/user_record";
import * as Notification from "./notification";

type EventTypeType = "notification_marked_read";
const eventType: EventTypeType = "notification_marked_read";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  notificationId: Notification.Id;
  // Not strictly required, also storing the recipient allows to filter the
  // notification-stream's events by user ID:
  recipient: UserRecord.Id;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  notificationId: Notification.idSchema.required(),
  recipient: UserRecord.idSchema,
});

export function createEvent(
  source: string,
  publisher: Identity,
  notificationId: Notification.Id,
  recipient: UserRecord.Id,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    time,
    publisher,
    notificationId,
    recipient,
  };
  logger.trace("Creating notification_mark_read event");

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
