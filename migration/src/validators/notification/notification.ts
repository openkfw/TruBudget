import Joi from "joi";

import { ValidationResult } from "..";
import * as UserRecord from "../user/user";

export type Id = string;

export const idSchema = Joi.string().max(36);
const businessEventSchema = Joi.object({
  type: Joi.string().required(),
  source: Joi.string().required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
}).unknown();

export const notificationTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("notification").required(),
  businessEvent: businessEventSchema.required(),
});




const schema = Joi.object({
  id: idSchema.required(),
  createdAt: Joi.date().iso().required(),
  recipient: UserRecord.idSchema,
  isRead: Joi.boolean().required(),
  // "object" due to recursiveness of validation:
  businessEvent: Joi.object(),
  projectId: Joi.string().max(32),
  subprojectId: Joi.string().max(32),
  workflowitemId: Joi.string().max(32),
  log: Joi.array().required().items(notificationTraceEventSchema),
});

export function validate(input): ValidationResult {
  const { error } = schema.validate(input);
  if (error === undefined)
    return {
      isError: false,
      data: input
    }
  return {
    isError: true,
    data: error
  }
}