import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { Identity } from "../organization/identity";
import * as UserRecord from "../organization/user_record";

export type Id = string;

export const idSchema = Joi.string().max(36);

export interface Notification {
  id: Id;
  createdAt: string; // ISO timestamp
  recipient: UserRecord.Id;
  businessEvent: BusinessEvent;
  projectId?: string;
  subprojectId?: string;
  workflowitemId?: string;
}

const schema = Joi.object({
  id: idSchema.required(),
  createdAt: Joi.date()
    .iso()
    .required(),
  recipient: Joi.string().required(),
  // "object" due to recursiveness of validation:
  businessEvent: Joi.object(),
  projectId: Joi.string().max(32),
  subprojectId: Joi.string().max(32),
  workflowitemId: Joi.string().max(32),
});

export function validate(input: any): Result.Type<Notification> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}
