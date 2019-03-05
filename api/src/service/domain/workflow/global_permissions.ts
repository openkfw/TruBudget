import Joi = require("joi");

import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
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
  log: Joi.array()
    .required()
    .items(globalPermissionsTraceEventSchema),
  additionalData: Joi.object(),
});

export function validate(input: any): Result.Type<GlobalPermissions> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}

export function identitiesAuthorizedFor(
  globalPermissions: GlobalPermissions,
  intent: Intent,
): Identity[] {
  return globalPermissions.permissions[intent] || [];
}
