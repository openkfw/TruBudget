import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as GlobalPermissions from "./domain/workflow/global_permissions";
import * as GlobalPermissionsGet from "./domain/workflow/global_permissions_get";

export async function getGlobalPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<GlobalPermissions.GlobalPermissions>> {
  return Cache.withCache(
    conn,
    ctx,
    async (cache) =>
      await GlobalPermissionsGet.getGlobalPermissions(ctx, serviceUser, {
        getGlobalPermissionsEvents: async () => {
          return cache.getGlobalEvents();
        },
      }),
  );
}
