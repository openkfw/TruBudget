import logger from "../lib/logger";
import Intent, { allIntents } from "./intents";
import { AuthToken } from "./token";
import { AllowedUserGroupsByIntent, People } from "./types";

// const groupsForUser = user =>
//   Sample.groups.filter(x => x.users.indexOf(user) !== -1).map(x => x.group);

const intersection = (groups1, groups2) => groups1.filter(g1 => groups2.indexOf(g1) !== -1);

export const hasIntersection = (actualGroups, allowedGroups) =>
  intersection(actualGroups, allowedGroups).length > 0;

export const getUserAndGroups = (token: AuthToken) => {
  return [token.userId, ...token.groups];
};

export const getAllowedIntents = (
  userAndGroups: People,
  resourcePermissions: AllowedUserGroupsByIntent,
): Intent[] => {
  if (userAndGroups.includes("root")) {
    return allIntents;
  }

  const allowedIntents = Object.keys(resourcePermissions as any).filter(intent =>
    hasIntersection(userAndGroups, resourcePermissions[intent]),
  ) as Intent[];
  logger.debug(
    { userAndGroups, allowedIntents },
    `Getting allowed intents for user ${userAndGroups[0]}`,
  );
  return allowedIntents;
};

const can = async (
  token: AuthToken,
  intent: Intent,
  resourcePermissions: AllowedUserGroupsByIntent,
): Promise<boolean> => {
  if (token.userId === "root") {
    // root can do everything
    logger.debug("Root access. All intents granted.");
    return true;
  } else {
    if (!resourcePermissions[intent]) {
      logger.info(
        { params: { resourcePermissions } },
        `Acces denied for user ${token.userId} with intent ${intent}`,
      );
      return false;
    }
    const allowedUsersAndGroups = resourcePermissions[intent];
    const currentUserAndGroups = await getUserAndGroups(token);
    const userAllowed = hasIntersection(currentUserAndGroups, allowedUsersAndGroups);
    logger.debug(
      { resourcePermissions },
      `${userAllowed ? "Allowed" : "Denied"} user ${token.userId} access with intent ${intent}`,
    );
    return userAllowed;
  }
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
  if (!canDo) {
    logger.error({ error: { token, intent, resourcePermissions } }, "User not authorized");
    throw { kind: "NotAuthorized", token, intent };
  }
  return;
};

export const throwIfUnauthorized = (
  token: AuthToken,
  intent: Intent,
  permissions: AllowedUserGroupsByIntent,
): Promise<undefined> => {
  return authorized(token, intent)(permissions);
};
