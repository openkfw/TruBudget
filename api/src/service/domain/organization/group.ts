import Joi = require("joi");

import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { Permissions, permissionsSchema } from "../permissions";
import { canAssumeIdentity } from "./auth_token";
import { GroupTraceEvent, groupTraceEventSchema } from "./group_trace_event";
import { Identity } from "./identity";
import { ServiceUser } from "./service_user";

export type Id = string;
export const idSchema = Joi.string();

export type Member = Identity;
export const memberSchema = Joi.string();
export const membersSchema = Joi.array().items(memberSchema);

export interface Group {
  id: Id;
  createdAt: string; // ISO timestamp
  displayName: string;
  description: string;
  members: Identity[];
  permissions: Permissions;
  log: GroupTraceEvent[];
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
}

const schema = Joi.object({
  id: idSchema.required(),
  createdAt: Joi.date().iso().required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  members: membersSchema.required(),
  permissions: permissionsSchema.required(),
  log: Joi.array().required().items(groupTraceEventSchema),
  additionalData: AdditionalData.schema.required(),
});

export function validate(input): Result.Type<Group> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}

export function permits(group: Group, actingUser: ServiceUser, intents: Intent[]): boolean {
  const eligibleIdentities: Identity[] = intents.reduce((acc: Identity[], intent: Intent) => {
    const eligibles = group.permissions[intent] || [];
    return acc.concat(eligibles);
  }, []);
  const hasPermission = eligibleIdentities.some((identity) =>
    canAssumeIdentity(actingUser, identity),
  );
  return hasPermission;
}
