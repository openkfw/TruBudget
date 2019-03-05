import Joi = require("joi");

import { BusinessEvent, businessEventSchema } from "../business_event";

export interface SubprojectTraceEvent {
  entityId: string;
  entityType: "subproject";
  businessEvent: BusinessEvent;
  snapshot: {
    displayName?: string;
  };
}

export const subprojectTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("subproject").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string(),
  }).required(),
});
