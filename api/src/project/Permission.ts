import { getAllowedIntents } from "../authz";
import Intent from "../authz/intents";
import { User, userIdentities } from "./User";

export type Permissions = { [key in Intent]?: string[] };

export function isAllowedToSee(permissions: Permissions, actingUser: User): boolean {
  const allowedIntent: Intent = "project.intent.listPermissions";
  const userIntents = getAllowedIntents(userIdentities(actingUser), permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  return hasPermission;
}

export function isAllowedToGrant(permissions: Permissions, actingUser: User): boolean {
  const allowedIntent: Intent = "project.intent.grantPermission";
  const userIntents = getAllowedIntents(userIdentities(actingUser), permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  return hasPermission;
}

export function isAllowedToRevoke(permissions: Permissions, actingUser: User): boolean {
  const allowedIntent: Intent = "project.intent.revokePermission";
  const userIntents = getAllowedIntents(userIdentities(actingUser), permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  return hasPermission;
}
