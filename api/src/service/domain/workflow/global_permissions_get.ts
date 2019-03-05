import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as GlobalPermissions from "./global_permissions";
import { sourceGlobalPermissions } from "./global_permissions_eventsourcing";

interface Repository {
  getGlobalPermissionsEvents(): Promise<BusinessEvent[]>;
}

export async function getGlobalPermissions(
  ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<GlobalPermissions.GlobalPermissions> {
  const allEvents = await repository.getGlobalPermissionsEvents();
  // Errors are ignored here:
  const { globalPermissions } = sourceGlobalPermissions(ctx, allEvents);

  // Check authorization (if not root):
  if (user.id !== "root") {
    const isAuthorized = GlobalPermissions.identitiesAuthorizedFor(
      globalPermissions,
      "global.listPermissions",
    ).some(identity => canAssumeIdentity(user, identity));
    if (!isAuthorized) {
      throw new NotAuthorized(ctx, user.id, undefined, "global.listPermissions");
    }
  }

  return globalPermissions;
}
