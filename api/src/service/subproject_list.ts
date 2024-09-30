import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectList from "./domain/workflow/subproject_list";
import * as SubprojectCacheHelper from "./subproject_cache_helper";

export async function listSubprojects(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Result.Type<Subproject.Subproject[]>> {
  logger.debug({ projectId }, "Listing subprojects");

  const visibleSubprojectsResult = await SubprojectList.getAllVisible(ctx, serviceUser, {
    getAllSubprojects: async () => {
      return await SubprojectCacheHelper.getAllSubprojects(conn, ctx, projectId);
    },
  });
  return Result.mapErr(
    visibleSubprojectsResult,
    (err) => new VError(err, "list subprojects failed"),
  );
}
