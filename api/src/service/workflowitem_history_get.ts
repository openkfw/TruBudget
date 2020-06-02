import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { WorkflowitemTraceEvent } from "./domain/workflow/workflowitem_trace_event";

import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as Cache from "./cache2";
import VError = require("verror");
import * as WorkflowitemHistory from "./domain/workflow/workflowitem_history_get";

export async function getWorkflowitemHistory(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  filter: WorkflowitemHistory.Filter,
): Promise<Result.Type<WorkflowitemTraceEvent[]>> {
  const workflowitemHistoryResult = await Cache.withCache(conn, ctx, async (cache) =>
    WorkflowitemHistory.getHistory(
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      workflowitemId,
      filter,
      {
        getWorkflowitem: async (projectId, subprojectId, workflowitemId) => {
          return cache.getWorkflowitem(projectId, subprojectId, workflowitemId);
        },
      },
    ),
  );
  return Result.mapErr(
    workflowitemHistoryResult,
    (err) => new VError(err, `could not get history of workflowitem with id ${workflowitemId}`),
  );
}
