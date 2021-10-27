import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import * as Cache from "./cache2";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserDisable from "./domain/organization/user_disable";
import { getGlobalPermissions } from "./global_permissions_get";
import { getUserAssignments } from "./user_assignments_get";
import { store } from "./store";
import * as UserQuery from "./user_query";
import { VError } from "verror";
import logger from "lib/logger";

export async function disableUser(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  issuerOrganization: string,
  revokee: UserDisable.RequestData,
): Promise<Result.Type<void>> {
  logger.debug({ revokee }, "Disabling user");

  const newEventsResult = await Cache.withCache(conn, ctx, async (cache) =>
    UserDisable.disableUser(ctx, serviceUser, issuerOrganization, revokee, {
      getUser: () => UserQuery.getUser(conn, ctx, serviceUser, revokee.userId),
      getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
      getUserAssignments: async () =>
        getUserAssignments(conn, ctx, serviceUser, issuerOrganization, revokee),
    }),
  );

  if (Result.isErr(newEventsResult)) return new VError(newEventsResult, "failed to disable user");
  const newEvents = newEventsResult;
  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }
}
