import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";

import * as GlobalPermissionGranted from "./global_permission_granted";
import * as GlobalPermissionRevoked from "./global_permission_revoked";
import * as GlobalPermissions from "./global_permissions";
import { GlobalPermissionsTraceEvent } from "./global_permissions_trace_event";

export function sourceGlobalPermissions(
  ctx: Ctx,
  events: BusinessEvent[],
): { globalPermissions: GlobalPermissions.GlobalPermissions; errors: EventSourcingError[] } {
  const globalPerms = { permissions: {}, log: [] };
  const errors: EventSourcingError[] = [];
  for (const event of events) {
    apply(ctx, globalPerms, event, errors);
  }
  return { globalPermissions: globalPerms, errors };
}

function apply(
  ctx: Ctx,
  globalPerms: GlobalPermissions.GlobalPermissions,
  event: BusinessEvent,
  errors: EventSourcingError[],
): void {
  if (event.type === "global_permission_granted") {
    applyGrantPermission(ctx, globalPerms, event, errors);
  }
  if (event.type === "global_permission_revoked") {
    applyRevokePermission(ctx, globalPerms, event, errors);
  }
}

function applyGrantPermission(
  ctx: Ctx,
  globalPerms: GlobalPermissions.GlobalPermissions,
  permissionGranted: GlobalPermissionGranted.Event,
  errors: EventSourcingError[],
): void {
  logger.trace({ event: permissionGranted }, "Applying grant permission event");

  const eligibleIdentities = globalPerms.permissions[permissionGranted.permission] || [];
  if (!eligibleIdentities.includes(permissionGranted.grantee)) {
    eligibleIdentities.push(permissionGranted.grantee);
  }

  globalPerms.permissions[permissionGranted.permission] = eligibleIdentities;

  const result = GlobalPermissions.validate(globalPerms);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: permissionGranted }, result));
    return;
  }

  const traceEvent: GlobalPermissionsTraceEvent = {
    entityId: "global_permissions",
    entityType: "global",
    businessEvent: permissionGranted,
  };
}

function applyRevokePermission(
  ctx: Ctx,
  globalPerms: GlobalPermissions.GlobalPermissions,
  permissionRevoked: GlobalPermissionRevoked.Event,
  errors: EventSourcingError[],
): void {
  logger.trace({ event: permissionRevoked }, "Applying permission revoked event");
  const eligibleIdentities = globalPerms.permissions[permissionRevoked.permission];
  if (eligibleIdentities !== undefined) {
    const foundIndex = eligibleIdentities.indexOf(permissionRevoked.revokee);
    const hasPermission = foundIndex !== -1;
    if (hasPermission) {
      // Remove the user from the array:
      eligibleIdentities.splice(foundIndex, 1);
    }
  }

  const result = GlobalPermissions.validate(globalPerms);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: permissionRevoked }, result));
    return;
  }

  const traceEvent: GlobalPermissionsTraceEvent = {
    entityId: "global_permissions",
    entityType: "global",
    businessEvent: permissionRevoked,
  };
}
