import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserGet from "./domain/organization/user_get";
import * as UserRecord from "./domain/organization/user_record";
import { Permissions } from "./domain/permissions";

export async function getUserPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  userId: UserRecord.Id,
): Promise<Result.Type<Permissions>> {
  const userResult = await Cache.withCache(conn, ctx, async (cache) =>
    UserGet.getOneUser(ctx, serviceUser, userId, {
      getUserEvents: async () => cache.getUserEvents(userId),
    }),
  );
  if (Result.isErr(userResult)) {
    return new VError(userResult, `failed to get user ${userId}`);
  }
  return userResult.permissions;
}
