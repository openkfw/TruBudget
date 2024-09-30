import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";

import * as GlobalPermissions from "./global_permissions";
import { identitiesAuthorizedFor } from "./global_permissions";

interface Repository {
  getGlobalPermissionsFromCache(): Promise<GlobalPermissions.GlobalPermissions>;
}

export async function getGlobalPermissions(
  ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<GlobalPermissions.GlobalPermissions> {
  const cachedGlobalPermissions = await repository.getGlobalPermissionsFromCache();

  filterPermissions(cachedGlobalPermissions, user);

  return cachedGlobalPermissions;
}

function filterPermissions(
  globalPermissions: GlobalPermissions.GlobalPermissions,
  user: ServiceUser,
): void {
  logger.trace("Flitering permissions for: ", user);

  if (user.id === "root") {
    // root always sees all permissions
    return;
  }

  if (GlobalPermissions.permits(globalPermissions, user, ["global.listPermissions"])) {
    // the user is entitled to see all permissions
    return;
  }

  // the user is neither root, nor allowed to see all permissions, so we restrict the
  // permissions to those the user is entitled for. This includes permissions that are
  // assigned to the user explicitly, as well as those that are assigned to a group the
  // user belongs to.
  const userVisiblePermissions = {};
  for (const intent of Object.keys(globalPermissions.permissions)) {
    const uservVisibleIdentities = identitiesAuthorizedFor(
      globalPermissions,
      intent as Intent,
    ).filter((identity) => canAssumeIdentity(user, identity));
    userVisiblePermissions[intent] = uservVisibleIdentities;
  }

  globalPermissions.permissions = userVisiblePermissions;
}
