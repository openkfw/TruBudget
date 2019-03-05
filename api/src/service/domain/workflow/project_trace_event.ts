import Joi = require("joi");

import { BusinessEvent, businessEventSchema } from "../business_event";

export interface ProjectTraceEvent {
  entityId: string;
  entityType: "project";
  businessEvent: BusinessEvent;
  snapshot: {
    displayName: string;
  };
}

export const projectTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("project").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string().required(),
  }).required(),
});
