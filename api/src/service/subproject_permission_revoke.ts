import { VError } from "verror";
import Intent from "../authz/intents";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectPermissionRevoke from "./domain/workflow/subproject_permission_revoke";
import { store } from "./store";

export { RequestData } from "./domain/workflow/project_create";

export async function revokeSubprojectPermission(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  revokee: Identity,
  intent: Intent,
): Promise<Result.Type<void>> {
  const newEventsResult = await Cache.withCache(conn, ctx, async (cache) =>
    SubprojectPermissionRevoke.revokeSubprojectPermission(
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      revokee,
      intent,
      {
        getSubproject: async (pId, spId) => {
          return cache.getSubproject(pId, spId);
        },
      },
    ),
  );
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, `close project failed`);
  }
  const newEvents = newEventsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
