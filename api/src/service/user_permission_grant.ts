import { VError } from "verror";
import Intent from "../authz/intents";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserPermissionGrant from "./domain/organization/user_permission_grant";
import * as Project from "./domain/workflow/project";
import { store } from "./store";
import * as UserQuery from "./user_query";

export { RequestData } from "./domain/workflow/project_create";

export async function grantUserPermission(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  userId: Project.Id,
  grantee: Identity,
  intent: Intent,
): Promise<Result.Type<void>> {
  const newEventsResult = await UserPermissionGrant.grantUserPermission(
    ctx,
    serviceUser,
    userId,
    grantee,
    intent,
    {
      getTargetUser: (id) => UserQuery.getUser(conn, ctx, serviceUser, id),
    },
  );
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, `failed to grant ${intent} to ${grantee}`);
  }
  const newEvents = newEventsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
