import logger from "lib/logger";
import VError = require("verror");

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as History from "./domain/workflow/historyFilter";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemHistory from "./domain/workflow/workflowitem_history_get";
import { WorkflowitemTraceEvent } from "./domain/workflow/workflowitem_trace_event";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";

export async function getWorkflowitemHistory(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  filter?: History.Filter,
): Promise<Result.Type<WorkflowitemTraceEvent[]>> {
  logger.debug({ projectId, subprojectId, workflowitemId, filter }, "Getting workflowitem history");

  const workflowitemHistoryResult = await WorkflowitemHistory.getHistory(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    workflowitemId,
    {
      getWorkflowitem: async (projectId, subprojectId, workflowitemId) => {
        return await WorkflowitemCacheHelper.getWorkflowitem(conn, ctx, projectId, workflowitemId);
      },
    },
    filter,
  );

  return Result.mapErr(
    workflowitemHistoryResult,
    (err) => new VError(err, `could not get history of workflowitem with id ${workflowitemId}`),
  );
}
