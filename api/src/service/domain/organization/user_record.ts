import Joi = require("joi");

import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { Permissions, permissionsSchema } from "../permissions";
import { canAssumeIdentity } from "./auth_token";
import { Identity } from "./identity";
import { ServiceUser } from "./service_user";
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
  createdAt: Joi.date().iso().required(),
  displayName: Joi.string().required(),
  organization: Joi.string().required(),
  passwordHash: Joi.string().required(),
  address: Joi.string().required(),
  encryptedPrivKey: Joi.string().required(),
  permissions: permissionsSchema.required(),
  log: Joi.array().required().items(userTraceEventSchema),
  additionalData: AdditionalData.schema.required(),
});

export function validate(input): Result.Type<UserRecord> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}

export function permits(user: UserRecord, actingUser: ServiceUser, intents: Intent[]): boolean {
  const eligibleIdentities: Identity[] = intents.reduce((acc: Identity[], intent: Intent) => {
    const eligibles = user.permissions[intent] || [];
    return acc.concat(eligibles);
  }, []);
  const hasPermission = eligibleIdentities.some((identity) =>
    canAssumeIdentity(actingUser, identity),
  );
  return hasPermission;
}
