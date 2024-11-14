import Joi = require("joi");

import { BusinessEvent, businessEventSchema } from "../business_event";

export interface WorkflowitemTraceEvent {
  entityId: string;
  entityType: "workflowitem";
  businessEvent: BusinessEvent;
  snapshot: {
    displayName?: string;
    amount?: string;
    currency?: string;
    amountType?: string;
    markdown?: string;
  };
}

export const workflowitemTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("workflowitem").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string(),
    amount: Joi.string(),
    currency: Joi.string(),
    amountType: Joi.string(),
    markdown: Joi.string().allow(""),
  }).required(),
});
