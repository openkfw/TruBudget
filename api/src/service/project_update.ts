import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
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
): Promise<Result.Type<void>> {
  const newEventsResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectUpdate.updateProject(ctx, serviceUser, projectId, requestData, {
      getProject: async (pId) => {
        return cache.getProject(pId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
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
