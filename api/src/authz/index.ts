import Intent from "./intents";
import { AuthToken } from "./token";
import { AllowedUserGroupsByIntent, GroupId, People } from "./types";

// const groupsForUser = user =>
//   Sample.groups.filter(x => x.users.indexOf(user) !== -1).map(x => x.group);

const intersection = (groups1, groups2) => groups1.filter(g1 => groups2.indexOf(g1) !== -1);

export const hasIntersection = (actualGroups, allowedGroups) =>
  intersection(actualGroups, allowedGroups).length > 0;

export const getUserAndGroups = async (token: AuthToken): Promise<GroupId[]> => {
  // TODO (await) get user's groups
  return [token.userId, token.organization];
};

export const getAllowedIntents = async (
  userAndGroups: People,
  resourcePermissions: AllowedUserGroupsByIntent,
): Promise<Intent[]> => {
  const isRoot = userAndGroups.includes("root");
  const allowedIntents = Object.keys(resourcePermissions as any).filter(
    intent => isRoot || hasIntersection(userAndGroups, resourcePermissions[intent]),
  ) as Intent[];
  return allowedIntents;
};

const can = async (
  token: AuthToken,
  intent: Intent,
  resourcePermissions: AllowedUserGroupsByIntent,
): Promise<boolean> => {
  if (token.userId === "root") {
    // root can do everything
    return true;
  } else {
    if (!resourcePermissions[intent]) return false;
    const allowedUsersAndGroups = resourcePermissions[intent];
    const currentUserAndGroups = await getUserAndGroups(token);
    return hasIntersection(currentUserAndGroups, allowedUsersAndGroups);
  }
};

const loggedCan = async (
  token: AuthToken,
  intent: Intent,
  resourcePermissions: AllowedUserGroupsByIntent,
): Promise<boolean> => {
  const canDo = await can(token, intent, resourcePermissions);
  console.log(
    `${canDo ? "ALLOWED" : "DENIED"} user ${token.userId} access with intent "${intent}"${
      resourcePermissions ? ` to ${JSON.stringify(resourcePermissions)}` : ""
    }`,
  );
  return canDo;
};

/*
 * Throws a NotAuthorizedError if the token holder is not authorized for the given
 * intent with respect to the given resource.
 *
 * @deprecated
 */
export const authorized = (token: AuthToken, intent: Intent) => async (
  resourcePermissions: AllowedUserGroupsByIntent,
): Promise<undefined> => {
  const canDo = await /*loggedC*/ can(token, intent, resourcePermissions);
  if (!canDo) throw { kind: "NotAuthorized", token, intent };
  return;
};

export const throwIfUnauthorized = (
  token: AuthToken,
  intent: Intent,
  permissions: AllowedUserGroupsByIntent,
): Promise<undefined> => {
  return authorized(token, intent)(permissions);
};
