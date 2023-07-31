import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import { VError } from "verror";
import * as Result from "../result";
import logger from "lib/logger";
import * as ProjectList from "./domain/workflow/project_list";
import * as ProjectCacheHelper from "./project_cache_helper";

export async function listProjects(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<Project.Project[]>> {
  logger.debug("Listing all projects");

  const visibleProjectsResult = await ProjectList.getAllVisible(ctx, serviceUser, {
    getAllProjects: async () => {
      return await ProjectCacheHelper.getAllProjects(conn, ctx);
    },
  });

  return Result.mapErr(visibleProjectsResult, (err) => new VError(err, "list projects failed"));
}
