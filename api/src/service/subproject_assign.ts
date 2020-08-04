import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectAssign from "./domain/workflow/subproject_assign";
import * as GroupQuery from "./group_query";
import { store } from "./store";

export async function assignSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  assignee: Identity,
): Promise<Result.Type<void>> {
  const assignSubprojectResult = await Cache.withCache(conn, ctx, async (cache) =>
    SubprojectAssign.assignSubproject(ctx, serviceUser, projectId, subprojectId, assignee, {
      getSubproject: async () => {
        return cache.getSubproject(projectId, subprojectId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    }),
  );

  if (Result.isErr(assignSubprojectResult)) {
    return new VError(assignSubprojectResult, `assign ${assignee} to subproject failed`);
  }
  const { newEvents } = assignSubprojectResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
