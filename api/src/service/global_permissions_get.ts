import { Ctx } from "../lib/ctx";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as GlobalPermissions from "./domain/workflow/global_permissions";
import * as GlobalPermissionsGet from "./domain/workflow/global_permissions_get";

export async function getGlobalPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<GlobalPermissions.GlobalPermissions> {
  return GlobalPermissionsGet.getGlobalPermissions(ctx, serviceUser, {
    getGlobalPermissionsEvents: async () => {
      await Cache2.refresh(conn, "global");
      return conn.cache2.eventsByStream.get("global") || [];
    },
  });
}
