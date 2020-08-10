import { Ctx } from "../lib/ctx";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectList from "./domain/workflow/project_list";
import { VError } from "verror";
import * as Result from "../result";

export async function listProjects(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<Project.Project[]>> {
  const visibleProjectsResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectList.getAllVisible(ctx, serviceUser, {
      getAllProjects: async () => {
        return cache.getProjects();
      },
    }),
  );
  return Result.mapErr(visibleProjectsResult, (err) => new VError(err, `list projects failed`));
}
