import * as Sample from "./sample";
import { UserId, ModelResult } from "./types";
import { Intent } from "./intents";

// const logAccess = (
//   user: UserId,
//   resource: ProtectedResource,
//   allowedDenied: "ALLOWED" | "DENIED"
// ) => {
//   console.log(
//     `${allowedDenied} user ${user} access to ${JSON.stringify(resource)}`
//   );
// };

// const groupsForUser = user =>
//   Sample.groups.filter(x => x.users.indexOf(user) !== -1).map(x => x.group);

// const groupIntersection = (groups1, groups2) =>
//   groups1.filter(g1 => groups2.indexOf(g1) !== -1);

// const isGroupIntersection = (actualGroups, allowedGroups) =>
//   groupIntersection(actualGroups, allowedGroups).length > 0;

const can = (user, intent: Intent, resource?) => {
  // Here we'd look up the resource's metadata in the chain to find out the following:
  // 1. which groups are allowed to execute the given intent,
  // 2. which groups does the user belong to.
  // Given that information, we can then simply check whether the groups intersect.

  // In this example everybody is allowed to see all projects, except Alice, who's only
  // allowed to see "Proj Two":
  switch (intent.intent) {
    case "list projects":
      return user !== "alice" || resource.title === "Proj Two";
    case "append subproject to project":
      return intent.projectId === "my-project";
    case "create project":
      return user === "alice";
    default:
      return false;
  }
};

const loggedCan = (user, intent, resource?) => {
  const canDo = can(user, intent, resource);
  console.log(
    `${canDo ? "ALLOWED" : "DENIED"} user ${user} access with intent "${intent.intent}"${
      resource ? ` to ${JSON.stringify(resource)}` : ""
    }`
  );
  return canDo;
};

export const authorize = (user: UserId, result: ModelResult) => {
  console.log(`Checking authorization for user ${user}: ${JSON.stringify(result)}`);
  switch (result.kind) {
    case "resource list":
      return result.resources.filter(resource => loggedCan(user, result.intent, resource));
    case "side effect":
      if (loggedCan(user, result.intent)) {
        console.log(`Invoking side effect..`);
        result.action();
      }
      break;
  }
};
