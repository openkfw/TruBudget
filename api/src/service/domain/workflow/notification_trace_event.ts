import Joi = require("joi");

import { BusinessEvent, businessEventSchema } from "../business_event";

export interface NotificationTraceEvent {
  entityId: string;
  entityType: "notification";
  businessEvent: BusinessEvent;
}

export const notificationTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("notification").required(),
  businessEvent: businessEventSchema.required(),
});
