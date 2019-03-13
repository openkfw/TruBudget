import { Ctx } from "../lib/ctx";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectUpdate from "./domain/workflow/project_update";
import * as GroupQuery from "./group_query";
import { store } from "./store";

export async function updateProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  requestData: ProjectUpdate.RequestData,
): Promise<void> {
  const { newEvents, errors } = await ProjectUpdate.updateProject(
    ctx,
    serviceUser,
    projectId,
    requestData,
    {
      getProjectEvents: async () => {
        await Cache2.refresh(conn, projectId);
        return conn.cache2.eventsByStream.get(projectId) || [];
      },
      getUsersForIdentity: async identity => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
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
