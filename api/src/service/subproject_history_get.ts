import logger from "lib/logger";
import VError = require("verror");

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as History from "./domain/workflow/historyFilter";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectHistory from "./domain/workflow/subproject_history_get";
import { SubprojectTraceEvent } from "./domain/workflow/subproject_trace_event";
import * as SubprojectCacheHelper from "./subproject_cache_helper";

export async function getSubprojectHistory(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  filter?: History.Filter,
): Promise<Result.Type<SubprojectTraceEvent[]>> {
  logger.debug({ projectId, subprojectId, filter }, "Getting subproject history");

  const subprojectHistoryResult = await SubprojectHistory.getHistory(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    {
      getSubproject: async (projectId, subprojectId) => {
        return await SubprojectCacheHelper.getSubproject(conn, ctx, projectId, subprojectId);
      },
    },
    filter,
  );
  return Result.mapErr(
    subprojectHistoryResult,
    (err) => new VError(err, `could not get history of subproject with id ${subprojectId}`),
  );
}
