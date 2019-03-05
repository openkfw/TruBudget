import Joi = require("joi");

import { BusinessEvent, businessEventSchema } from "../business_event";

export interface GroupTraceEvent {
  entityId: string;
  entityType: "group";
  businessEvent: BusinessEvent;
  snapshot: {
    displayName: string;
  };
}

export const groupTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("group").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string().required(),
  }).required(),
});
