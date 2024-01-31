import Joi = require("joi");
import { ValidationResult } from "..";


import * as Project from "../project/project";
import * as Subproject from "../subproject/subproject";
import * as UserRecord from "../user/user";
import * as Notification from "./notification";


const eventType = "notification_created";
export const businessEventSchema = Joi.object({
  type: Joi.string().required(),
  source: Joi.string().required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
}).unknown();


export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  notificationId: Notification.idSchema.required(),
  recipient: UserRecord.idSchema,
  // "object" due to recursiveness of validation:
  businessEvent: businessEventSchema,
  projectId: Project.idSchema,
  subprojectId: Subproject.idSchema,
  workflowitemId: Joi.string().required(),
}).options({ stripUnknown: true });

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
