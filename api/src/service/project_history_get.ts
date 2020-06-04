import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectHistory from "./domain/workflow/project_history_get";
import { ProjectTraceEvent } from "./domain/workflow/project_trace_event";
import VError = require("verror");

export async function getProjectHistory(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  filter: ProjectHistory.Filter,
): Promise<Result.Type<ProjectTraceEvent[]>> {
  const projectHistoryResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectHistory.getHistory(ctx, serviceUser, projectId, filter, {
      getProject: async (projectId) => {
        return cache.getProject(projectId);
      },
    }),
  );
  return Result.mapErr(
    projectHistoryResult,
    (err) => new VError(err, `could not get history of project with id ${projectId}`),
  );
}
