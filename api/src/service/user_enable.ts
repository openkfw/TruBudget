import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserEnable from "./domain/organization/user_enable";
import { getGlobalPermissions } from "./global_permissions_get";
import { store } from "./store";
import * as UserQuery from "./user_query";
import { VError } from "verror";
import logger from "lib/logger";

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
