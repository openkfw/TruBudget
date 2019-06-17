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
): Promise<void> {
  const result = await Cache.withCache(conn, ctx, async cache =>
    ProjectPermissionGrant.grantProjectPermission(ctx, serviceUser, projectId, grantee, intent, {
      getProject: async id => {
        return cache.getProject(id);
      },
    }),
  );
  if (Result.isErr(result)) return Promise.reject(result);

  for (const event of result.newEvents) {
    await store(conn, ctx, event);
  }
}
