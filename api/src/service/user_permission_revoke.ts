import { VError } from "verror";
import Intent from "../authz/intents";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserPermissionRevoke from "./domain/organization/user_permission_revoke";
import * as UserRecord from "./domain/organization/user_record";
import { store } from "./store";
import * as UserQuery from "./user_query";

export { RequestData } from "./domain/workflow/project_create";

export async function revokeUserPermission(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  userId: UserRecord.Id,
  revokee: Identity,
  intent: Intent,
): Promise<Result.Type<void>> {
  const newEventsResult = await Cache.withCache(conn, ctx, async (cache) =>
    UserPermissionRevoke.revokeUserPermission(ctx, serviceUser, userId, revokee, intent, {
      getTargetUser: (id) => UserQuery.getUser(conn, ctx, serviceUser, id),
    }),
  );
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, `failed to grant ${intent} to ${revokee}`);
  }
  const newEvents = newEventsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
