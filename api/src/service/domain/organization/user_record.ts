import Joi = require("joi");

import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { Permissions, permissionsSchema } from "../permissions";
import { UserTraceEvent, userTraceEventSchema } from "./user_trace_event";

export type Id = string;
export const idSchema = Joi.string().max(32);

export interface UserRecord {
  id: string;
  createdAt: string; // ISO timestamp
  displayName: string;
  organization: string;
  passwordHash: string;
  address: string;
  encryptedPrivKey: string;
  permissions: Permissions;
  log: UserTraceEvent[];
  additionalData: object;
}

const schema = Joi.object({
  id: idSchema.required(),
  createdAt: Joi.date()
    .iso()
    .required(),
  displayName: Joi.string().required(),
  organization: Joi.string().required(),
  passwordHash: Joi.string().required(),
  address: Joi.string().required(),
  encryptedPrivKey: Joi.string().required(),
  permissions: permissionsSchema.required(),
  log: Joi.array()
    .required()
    .items(userTraceEventSchema),
  additionalData: AdditionalData.schema.required(),
});

export function validate(input: any): Result.Type<Event> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}
