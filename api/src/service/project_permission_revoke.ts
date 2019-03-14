import Intent from "../authz/intents";
import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectPermissionRevoke from "./domain/workflow/project_permission_revoke";
import { loadProjectEvents } from "./load";
import { store } from "./store";

export { RequestData } from "./domain/workflow/project_create";

export async function revokeProjectPermission(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  revokee: Identity,
  intent: Intent,
): Promise<void> {
  const { newEvents, errors } = await ProjectPermissionRevoke.revokeProjectPermission(
    ctx,
    serviceUser,
    projectId,
    revokee,
    intent,
    {
      getProjectEvents: async () => loadProjectEvents(conn, projectId),
    },
  );
  if (errors.length > 0) return Promise.reject(errors);

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
