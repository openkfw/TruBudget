import VError = require("verror");

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as SnapshotService from "./cache_snapshot";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as History from "./domain/workflow/historyFilter";
import * as Project from "./domain/workflow/project";
import * as ProjectEventSourcing from "./domain/workflow/project_eventsourcing";
import * as ProjectHistory from "./domain/workflow/project_history_get";
import { ProjectTraceEvent } from "./domain/workflow/project_trace_event";
import { Item } from "./liststreamitems";

const MAX_ITEM_COUNT = 0x7fffffff;

export async function getProjectHistory(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  filter?: History.Filter,
): Promise<Result.Type<ProjectTraceEvent[]>> {
  logger.debug({ projectId, filter }, "Getting history of project");

  const projectHistoryResult = await ProjectHistory.getHistory(
    ctx,
    serviceUser,
    projectId,
    {
      getProject: async (projectId) => {
        const rpcClient = conn.multichainClient.getRpcClient();
        let items: Item[] = [];
        try {
          items = await rpcClient.invoke(
            "liststreamkeyitems",
            projectId,
            "self",
            false,
            MAX_ITEM_COUNT,
          );
          if (items.length == 0) {
            return new VError("Data Not Found");
          }
        } catch (e) {
          return new VError("Data Not Found");
        }
        items = items.filter((item) => !item.keys.includes("snapshot"));

        let parsedEvents = await SnapshotService.parseBusinessEvents(items, projectId);
        const businessEvents = parsedEvents.filter(Result.isOk);
        return ProjectEventSourcing.sourceProjectFromSnapshot(ctx, businessEvents, true);
      },
    },
    filter,
  );

  return Result.mapErr(
    projectHistoryResult,
    (err) => new VError(err, `could not get history of project with id ${projectId}`),
  );
}
