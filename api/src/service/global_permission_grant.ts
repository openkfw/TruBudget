import Intent from "../authz/intents";
import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as GlobalPermissionsGrant from "./domain/workflow/global_permission_grant";
import { getGlobalPermissions } from "./global_permissions_get";
import { store } from "./store";

export async function grantGlobalPermission(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  grantee: Identity,
  permission: Intent,
): Promise<void> {
  const { newEvents, errors } = await GlobalPermissionsGrant.grantGlobalPermission(
    ctx,
    serviceUser,
    grantee,
    permission,
    {
      getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
    },
  );
  if (errors.length > 0) return Promise.reject(errors);
  if (!newEvents.length) {
    return Promise.reject(`Generating events failed: ${JSON.stringify(newEvents)}`);
  }

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
