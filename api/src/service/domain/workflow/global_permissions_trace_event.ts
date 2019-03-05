import Joi = require("joi");

import { BusinessEvent, businessEventSchema } from "../business_event";

export interface GlobalPermissionsTraceEvent {
  entityId: "global_permissions";
  entityType: "global";
  businessEvent: BusinessEvent;
}

export const globalPermissionsTraceEventSchema = Joi.object({
  entityId: Joi.valid("global_permissions").required(),
  entityType: Joi.valid("global").required(),
  businessEvent: businessEventSchema.required(),
});
