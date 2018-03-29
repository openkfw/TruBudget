import * as Sample from "./sample";
import { UserId, ProtectedResource, Resource } from "./types";

const logAccess = (
  user: UserId,
  resource: ProtectedResource,
  allowedDenied: "ALLOWED" | "DENIED"
) => {
  console.log(
    `${allowedDenied} user ${user} access to ${JSON.stringify(resource)}`
  );
};

const groupsForUser = user =>
  Sample.groups.filter(x => x.users.indexOf(user) !== -1).map(x => x.group);

const groupIntersection = (groups1, groups2) =>
  groups1.filter(g1 => groups2.indexOf(g1) !== -1);

const isGroupIntersection = (actualGroups, allowedGroups) =>
  groupIntersection(actualGroups, allowedGroups).length > 0;

export function filter(
  user: UserId,
  requestedPermission: string
): (ProtectedResource) => boolean {
  return function(resource: ProtectedResource): boolean {
    let result = false;
    if (resource.kind === "project") {
      // TODO testing permissions here
      const allowedGroups = resource.permissions[requestedPermission];
      const userGroups = groupsForUser(user).concat([user]);
      console.log(`allowed groups: ${allowedGroups}`);
      console.log(`user's groups: ${userGroups}`);
      const isAllowed = isGroupIntersection(userGroups, allowedGroups);
      result = isAllowed;
    } else {
      result = false;
    }
    logAccess(user, resource, result ? "ALLOWED" : "DENIED");
    return result;
  };
}
