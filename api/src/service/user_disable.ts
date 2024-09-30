import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserDisable from "./domain/organization/user_disable";
import * as UserQuery from "./domain/organization/user_query";
import { getGlobalPermissions } from "./global_permissions_get";
import { store } from "./store";
import { getUserAssignments } from "./user_assignments_get";

export async function disableUser(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  issuerOrganization: string,
  revokee: UserDisable.RequestData,
): Promise<Result.Type<void>> {
  logger.debug({ revokee }, "Disabling user");

  const newEventsResult = await Cache.withCache(conn, ctx, async (_cache) =>
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
