import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectUpdate from "./domain/workflow/subproject_update";
import * as GroupQuery from "./group_query";
import { store } from "./store";

export async function updateSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  requestData: SubprojectUpdate.RequestData,
): Promise<Result.Type<void>> {
  const newEventsResult = await Cache.withCache(conn, ctx, async (cache) =>
    SubprojectUpdate.updateSubproject(ctx, serviceUser, projectId, subprojectId, requestData, {
      getSubproject: async (pId, spId) => {
        return cache.getSubproject(pId, spId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    }),
  );
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, `close project failed`);
  }
  const newEvents = newEventsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
