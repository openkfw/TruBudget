import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectAssign from "./domain/workflow/project_assign";
import * as GroupQuery from "./group_query";
import { store } from "./store";

export async function assignProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  assignee: Identity,
): Promise<Result.Type<void>> {
  const assignProjectresult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectAssign.assignProject(ctx, serviceUser, projectId, assignee, {
      getProject: async () => {
        return cache.getProject(projectId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    }),
  );

  if (Result.isErr(assignProjectresult)) {
    return new VError(assignProjectresult, `assign ${assignee} to project failed`);
  }
  const { newEvents } = assignProjectresult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
