import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as Group from "./domain/organization/group";
import * as GroupGet from "./domain/organization/group_get";
import { ServiceUser } from "./domain/organization/service_user";
import { Permissions } from "./domain/permissions";

export async function getGroupPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
): Promise<Result.Type<Permissions>> {
  const groupResult = await Cache.withCache(conn, ctx, async (cache) =>
    GroupGet.getOneGroup(ctx, serviceUser, groupId, {
      getGroupEvents: async () => cache.getGroupEvents(groupId),
    }),
  );
  if (Result.isErr(groupResult)) {
    return new VError(groupResult, `failed to get group ${groupId}`);
  }
  return groupResult.permissions;
}
