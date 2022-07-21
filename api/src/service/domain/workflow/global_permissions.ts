import Joi = require("joi");

import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { canAssumeIdentity } from "../organization/auth_token";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Permissions from "../permissions";
import {
  GlobalPermissionsTraceEvent,
  globalPermissionsTraceEventSchema,
} from "./global_permissions_trace_event";

export interface GlobalPermissions {
  permissions: Permissions.Permissions;
  log: GlobalPermissionsTraceEvent[];
}

const schema = Joi.object({
  permissions: Permissions.permissionsSchema.required(),
  log: Joi.array().required().items(globalPermissionsTraceEventSchema),
  additionalData: AdditionalData.schema,
});

export function validate(input): Result.Type<GlobalPermissions> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}

export function identitiesAuthorizedFor(
  globalPermissions: GlobalPermissions,
  intent: Intent,
): Identity[] {
  return globalPermissions.permissions[intent] || [];
}

export function permits(
  globalPermissions: GlobalPermissions,
  actingUser: ServiceUser,
  intents: Intent[],
): boolean {
  const eligibleIdentities: Identity[] = intents.reduce((acc: Identity[], intent: Intent) => {
    const eligibles = globalPermissions.permissions[intent] || [];
    return acc.concat(eligibles);
  }, []);

  const hasPermission = eligibleIdentities.some((identity) =>
    canAssumeIdentity(actingUser, identity),
  );

  return hasPermission;
}
