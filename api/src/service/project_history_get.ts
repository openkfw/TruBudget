import logger from "lib/logger";
import VError = require("verror");

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as History from "./domain/workflow/historyFilter";
import * as Project from "./domain/workflow/project";
import * as ProjectHistory from "./domain/workflow/project_history_get";
import { ProjectTraceEvent } from "./domain/workflow/project_trace_event";
import * as ProjectCacheHelper from "./project_cache_helper";

export async function getProjectHistory(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  filter?: History.Filter,
): Promise<Result.Type<ProjectTraceEvent[]>> {
  logger.debug({ projectId, filter }, "Getting history of project");

  /*const projectHistoryResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectHistory.getHistory(
      ctx,
      serviceUser,
      projectId,
      {
        getProject: async (projectId) => {
          return cache.getProject(projectId);
        },
      },
      filter,
    ),
  );*/

  // TODO fetch all stream items, remove logs from snapshot

  const projectHistoryResult = await ProjectHistory.getHistory(
    ctx,
    serviceUser,
    projectId,
    {
      getProject: async (projectId) => {
        return await ProjectCacheHelper.getProject(conn, ctx, projectId);
      },
    },
    filter,
  );

  return Result.mapErr(
    projectHistoryResult,
    (err) => new VError(err, `could not get history of project with id ${projectId}`),
  );
}
