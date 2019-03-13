import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as GlobalPermissions from "./domain/workflow/global_permissions";
import * as GlobalPermissionsGet from "./domain/workflow/global_permissions_get";
import { loadGlobalEvents } from "./load";

export async function getGlobalPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<GlobalPermissions.GlobalPermissions> {
  return GlobalPermissionsGet.getGlobalPermissions(ctx, serviceUser, {
    getGlobalPermissionsEvents: async () => loadGlobalEvents(conn),
  });
}
