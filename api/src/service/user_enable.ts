import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserEnable from "./domain/organization/user_enable";
import * as UserQuery from "./domain/organization/user_query";
import { getGlobalPermissions } from "./global_permissions_get";
import { store } from "./store";

export async function enableUser(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  issuerOrganization: string,
  grantee: UserEnable.RequestData,
): Promise<Result.Type<void>> {
  logger.debug({ grantee }, "Enable user");

  const newEventsResult = await UserEnable.enableUser(
    ctx,
    serviceUser,
    issuerOrganization,
    grantee,
    {
      getUser: () => UserQuery.getUser(conn, ctx, serviceUser, grantee.userId),
      getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
    },
  );

  if (Result.isErr(newEventsResult)) return new VError(newEventsResult, "failed to enable user");

  const newEvents = newEventsResult;
  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }
}
