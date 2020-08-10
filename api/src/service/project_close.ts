import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectClose from "./domain/workflow/project_close";
import * as GroupQuery from "./group_query";
import { store } from "./store";

export async function closeProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Result.Type<void>> {
  const closeProjectResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectClose.closeProject(ctx, serviceUser, projectId, {
      getProject: async () => {
        return cache.getProject(projectId);
      },
      getSubprojects: async (pId) => {
        return cache.getSubprojects(pId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    }),
  );

  if (Result.isErr(closeProjectResult)) {
    return new VError(closeProjectResult, `close project ${projectId} failed`);
  }
  const { newEvents } = closeProjectResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
