import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectClose from "./domain/workflow/subproject_close";
import * as GroupQuery from "./group_query";
import { store } from "./store";

export async function closeSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
): Promise<Result.Type<void>> {
  const closeSubprojectResult = await Cache.withCache(conn, ctx, async (cache) =>
    SubprojectClose.closeSubproject(ctx, serviceUser, projectId, subprojectId, {
      getSubproject: async (pId, spId) => {
        return cache.getSubproject(pId, spId);
      },
      getWorkflowitems: async (pId, spId) => {
        return cache.getWorkflowitems(pId, spId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    }),
  );

  if (Result.isErr(closeSubprojectResult)) {
    return new VError(closeSubprojectResult, `close subproject failed`);
  }
  const { newEvents } = closeSubprojectResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
