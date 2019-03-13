import { Ctx } from "../lib/ctx";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectClose from "./domain/workflow/project_close";
import * as GroupQuery from "./group_query";
import { store } from "./store";
import { loadProjectEvents } from "./load";

export async function closeProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<void> {
  const { newEvents, errors } = await ProjectClose.closeProject(ctx, serviceUser, projectId, {
    getProjectEvents: async () => loadProjectEvents(conn, projectId),
    getUsersForIdentity: async identity =>
      GroupQuery.resolveUsers(conn, ctx, serviceUser, identity),
  });
  if (errors.length > 0) return Promise.reject(errors);
  if (!newEvents.length) {
    return Promise.reject(`Generating events failed: ${JSON.stringify(newEvents)}`);
  }

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
