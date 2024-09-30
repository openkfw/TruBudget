import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectGet from "./domain/workflow/subproject_get";
import * as SubprojectCacheHelper from "./subproject_cache_helper";

export async function getSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
): Promise<Result.Type<Subproject.Subproject>> {
  logger.debug({ projectId, subprojectId }, "Getting subproject");

  const subprojectResult = await SubprojectGet.getSubproject(ctx, serviceUser, projectId, {
    getSubproject: async () => {
      return await SubprojectCacheHelper.getSubproject(conn, ctx, projectId, subprojectId);
    },
  });
  return Result.mapErr(
    subprojectResult,
    (err) => new VError(err, `could not fetch subproject ${subprojectId}`),
  );
}
