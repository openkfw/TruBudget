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
import { Item } from "./liststreamitems";
import * as SnapshotService from "./cache_snapshot";
import * as WorkflowitemEventSourcing from "./domain/workflow/workflowitem_eventsourcing";

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
        const rpcClient = conn.multichainClient.getRpcClient();
        let items: Item[] = [];
        try {
          items = await rpcClient.invoke(
            "liststreamkeyitems",
            projectId,
            workflowitemId,
            false,
            0x7fffffff,
          );
          if (items.length == 0) {
            return new VError("Data Not Found");
          }
        } catch (e) {
          return new VError("Data Not Found");
        }
        items = items.filter((item) => !item.keys.includes(workflowitemId + "_snapshot"));

        let parsedEvents = await SnapshotService.parseBusinessEvents(items, projectId);
        const businessEvents = parsedEvents.filter(Result.isOk);

        return WorkflowitemEventSourcing.sourceWorkflowitemFromSnapshot(ctx, businessEvents, true);
      },
    },
    filter,
  );

  return Result.mapErr(
    workflowitemHistoryResult,
    (err) => new VError(err, `could not get history of workflowitem with id ${workflowitemId}`),
  );
}
