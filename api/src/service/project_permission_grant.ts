import Intent from "../authz/intents";
import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectPermissionGrant from "./domain/workflow/project_permission_grant";
import { loadProjectEvents } from "./load";
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
  const { newEvents, errors } = await ProjectPermissionGrant.grantProjectPermission(
    ctx,
    serviceUser,
    projectId,
    grantee,
    intent,
    {
      getProjectEvents: async () => loadProjectEvents(conn, projectId),
    },
  );
  if (errors.length > 0) return Promise.reject(errors);
  if (!newEvents.length) {
    return Promise.reject(`Generating events failed: ${JSON.stringify(newEvents)}`);
  }

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
