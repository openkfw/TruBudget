import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { BusinessEvent, businessEventSchema } from "../business_event";
import { Identity } from "../organization/identity";
import * as Notification from "./notification";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";

type eventTypeType = "notification_created";
const eventType: eventTypeType = "notification_created";

export interface Event {
  id: Notification.Id;
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  // TODO: can a notification be send to a group? if yes, identity type is correct
  recipient: Identity;
  businessEvent: BusinessEvent;
  projectId?: Project.Id;
  subprojectId?: Subproject.Id;
  workflowitemId?: Workflowitem.Id;
}

export const schema = Joi.object({
  id: Notification.idSchema.required(),
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
  businessEvent: businessEventSchema,
  projectId: Project.idSchema,
  subprojectId: Subproject.idSchema,
  workflowitemId: Workflowitem.idSchema,
});

export function createEvent(
  id: Notification.Id,
  source: string,
  publisher: Identity,
  recipient: Identity,
  businessEvent: BusinessEvent,
  projectId?: Project.Id,
  subprojectId?: Subproject.Id,
  workflowitemId?: Workflowitem.Id,
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
