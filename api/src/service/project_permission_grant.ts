import { VError } from "verror";
import Intent from "../authz/intents";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectPermissionGrant from "./domain/workflow/project_permission_grant";
import { store } from "./store";

export { RequestData } from "./domain/workflow/project_create";

export async function grantProjectPermission(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  grantee: Identity,
  intent: Intent,
): Promise<Result.Type<void>> {
  const newEventsResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectPermissionGrant.grantProjectPermission(ctx, serviceUser, projectId, grantee, intent, {
      getProject: async (id) => {
        return cache.getProject(id);
      },
    }),
  );
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, `grant project permission failed`);
  }
  const newEvents = newEventsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
