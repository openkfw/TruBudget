import Joi = require("joi");

import { BusinessEvent, businessEventSchema } from "../business_event";

export interface UserTraceEvent {
  entityId: string;
  entityType: "user";
  businessEvent: BusinessEvent;
  snapshot: {
    displayName: string;
  };
}

export const userTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("user").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string().required(),
  }).required(),
});
