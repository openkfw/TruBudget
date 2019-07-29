import Joi = require("joi");
import uuid = require("uuid");
import { VError } from "verror";

import * as Result from "../../../result";
import { BusinessEvent, businessEventSchema } from "../business_event";
import { Identity } from "../organization/identity";
import * as UserRecord from "../organization/user_record";
import * as Notification from "./notification";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";

type eventTypeType = "notification_created";
const eventType: eventTypeType = "notification_created";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  notificationId: Notification.Id;
  recipient: UserRecord.Id;
  businessEvent: BusinessEvent;
  projectId?: Project.Id;
  subprojectId?: Subproject.Id;
  workflowitemId?: Workflowitem.Id;
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
  notificationId: Notification.idSchema.required(),
  recipient: UserRecord.idSchema,
  // "object" due to recursiveness of validation:
  businessEvent: businessEventSchema,
  projectId: Project.idSchema,
  subprojectId: Subproject.idSchema,
  workflowitemId: Workflowitem.idSchema,
}).options({ stripUnknown: true });

export function createEvent(
  source: string,
  publisher: Identity,
  recipient: UserRecord.Id,
  businessEvent: BusinessEvent,
  projectId?: Project.Id,
  subprojectId?: Subproject.Id,
  workflowitemId?: Workflowitem.Id,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    time,
    publisher,
    notificationId: uuid.v4(),
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
  const { error, value } = Joi.validate(input, schema, { allowUnknown: true });
  return !error ? value : error;
}
