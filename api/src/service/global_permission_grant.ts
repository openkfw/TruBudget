import { VError } from "verror";

import Intent from "../authz/intents";
import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import * as GroupQuery from "./domain/organization/group_query";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserQuery from "./domain/organization/user_query";
import * as GlobalPermissionsGrant from "./domain/workflow/global_permission_grant";
import { getGlobalPermissions } from "./global_permissions_get";
import { store } from "./store";

export async function grantGlobalPermission(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  serviceUserOrganization: string,
  grantee: Identity,
  permission: Intent,
): Promise<Result.Type<void>> {
  logger.debug({ permission, grantee }, "Granting global permission");
  const result = await GlobalPermissionsGrant.grantGlobalPermission(
    ctx,
    serviceUser,
    serviceUserOrganization,
    grantee,
    permission,
    {
      getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
      isGroup: async (granteeId) => GroupQuery.groupExists(conn, ctx, serviceUser, granteeId),
      getUser: async (userId) => UserQuery.getUser(conn, ctx, serviceUser, userId),
    },
  );
  if (Result.isErr(result)) return new VError(result, "failed to grant global permission");
  const newEvents = result;
  if (newEvents.length === 0) {
    return new Error(`Generating events failed: ${JSON.stringify(newEvents)}`);
  }

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }
}
