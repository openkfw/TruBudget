import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserEnable from "./domain/organization/user_enable";
import { getGlobalPermissions } from "./global_permissions_get";
import { store } from "./store";
import * as UserQuery from "./user_query";
import { VError } from "verror";

export async function enableUser(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  issuerOrganization: string,
  revokee: UserEnable.RequestData,
): Promise<Result.Type<void>> {
  const newEventsResult = await UserEnable.enableUser(ctx, issuer, issuerOrganization, revokee, {
    getUser: () => UserQuery.getUser(conn, ctx, issuer, revokee.userId),
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, issuer),
  });
  if (Result.isErr(newEventsResult)) return new VError(newEventsResult, "failed to enable user");
  const newEvents = newEventsResult;
  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
