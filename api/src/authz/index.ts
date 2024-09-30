import { TruBudgetError } from "../error";
import logger from "../lib/logger";

import Intent, { allIntents } from "./intents";
import { AuthToken } from "./token";
import { People, Permissions } from "./types";

// const groupsForUser = user =>
//   Sample.groups.filter(x => x.users.indexOf(user) !== -1).map(x => x.group);

const intersection = (groups1, groups2): People =>
  groups1.filter((g1) => groups2.indexOf(g1) !== -1);

export const hasIntersection = (actualGroups, allowedGroups): boolean =>
  intersection(actualGroups, allowedGroups).length > 0;

export const getUserAndGroups = (token: { userId: string; groups: string[] }): string[] => {
  return [token.userId, ...token.groups];
};

export const getAllowedIntents = (
  userAndGroups: People,
  resourcePermissions: Permissions,
): Intent[] => {
  if (userAndGroups.includes("root")) {
    return allIntents;
  }
  const allowedIntents = Object.keys(resourcePermissions as string).filter((intent) =>
    hasIntersection(userAndGroups, resourcePermissions[intent]),
  ) as Intent[];
  return allowedIntents;
};

const can = async (
  token: AuthToken,
  intent: Intent,
  resourcePermissions: Permissions,
): Promise<boolean> => {
  if (token.userId === "root") {
    // root can do everything
    logger.debug("Root access. All intents granted.");
    return true;
  } else {
    if (!resourcePermissions[intent]) {
      logger.info(
        { params: { resourcePermissions } },
        `Access denied for user ${token.userId} with intent ${intent}`,
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
export const authorized =
  (token: AuthToken, intent: Intent) =>
  async (resourcePermissions: Permissions): Promise<undefined> => {
    const canDo = await /*loggedC*/ can(token, intent, resourcePermissions);
    if (!canDo) {
      throw new TruBudgetError({ kind: "NotAuthorized", token, intent });
    }
    return;
  };

export const throwIfUnauthorized = (
  token: AuthToken,
  intent: Intent,
  permissions: Permissions,
): Promise<undefined> => {
  return authorized(token, intent)(permissions);
};
