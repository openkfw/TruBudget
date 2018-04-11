import * as Sample from "./sample";
import { AllowedUserGroupsByIntent } from "./types";
import Intent from "./intents";
import { AuthToken } from "./token";

// const groupsForUser = user =>
//   Sample.groups.filter(x => x.users.indexOf(user) !== -1).map(x => x.group);

// const groupIntersection = (groups1, groups2) =>
//   groups1.filter(g1 => groups2.indexOf(g1) !== -1);

// const isGroupIntersection = (actualGroups, allowedGroups) =>
//   groupIntersection(actualGroups, allowedGroups).length > 0;

const can = async (
  token: AuthToken,
  intent: Intent,
  resourcePermissions: AllowedUserGroupsByIntent
): Promise<boolean> => {
  if (token.userId === "root") {
    // root may do everything
    return true;
  } else {
    // TODO read from the chain and decide
    return true;
  }
};

const loggedCan = async (
  token: AuthToken,
  intent: Intent,
  resourcePermissions: AllowedUserGroupsByIntent
): Promise<boolean> => {
  const canDo = await can(token, intent, resourcePermissions);
  console.log(
    `${canDo ? "ALLOWED" : "DENIED"} user ${token.userId} access with intent "${intent}"${
      resourcePermissions ? ` to ${JSON.stringify(resourcePermissions)}` : ""
    }`
  );
  return canDo;
};

/*
 * Throws a NotAuthorizedError if the token holder is not authorized for the given
 * intent with respect to the given resource.
 */
export const authorized = (token: AuthToken, intent: Intent) => async (
  resourcePermissions: AllowedUserGroupsByIntent
): Promise<undefined> => {
  const canDo = await loggedCan(token, intent, resourcePermissions);
  if (!canDo) throw { kind: "NotAuthorized", token, intent };
  return;
};
