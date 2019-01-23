import { getAllowedIntents } from "../authz";
import Intent from "../authz/intents";
import { User, userIdentities } from "./User";

export type Permission = { [key in Intent]?: string[] };

export type Permissions = { [key in Intent]?: string[] };

export function isAllowedToList(permissions: Permissions, actingUser: User): boolean {
  const allowedIntents: Intent[] = ["global.listPermissions"];
  const userIntents = getAllowedIntents(userIdentities(actingUser), permissions);
  const hasPermission = allowedIntents.some(allowedIntent => userIntents.includes(allowedIntent));
  return hasPermission;
}
