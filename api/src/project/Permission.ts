import { getAllowedIntents } from "../authz";
import Intent from "../authz/intents";
import { Permissions } from "../authz/types";
import { User, userIdentities } from "./User";

export function isAllowedTo(
  allowedIntent: Intent,
  permissions: Permissions,
  actingUser: User,
): boolean {
  const userIntents = getAllowedIntents(userIdentities(actingUser), permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  return hasPermission;
}
