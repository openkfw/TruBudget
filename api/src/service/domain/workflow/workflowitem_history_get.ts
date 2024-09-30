import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";

import { Filter, filterTraceEvents } from "./historyFilter";
import * as Workflowitem from "./workflowitem";
import { WorkflowitemTraceEvent } from "./workflowitem_trace_event";

interface Repository {
  getWorkflowitem(
    projectId,
    subprojectId,
    workflowitemId,
  ): Promise<Result.Type<Workflowitem.Workflowitem>>;
}

export const getHistory = async (
  ctx: Ctx,
  user: ServiceUser,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  repository: Repository,
  filter?: Filter,
): Promise<Result.Type<WorkflowitemTraceEvent[]>> => {
  logger.trace("Fetching workflowitem history ...");

  const workflowitem = await repository.getWorkflowitem(projectId, subprojectId, workflowitemId);

  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  logger.trace({ user }, "Checking user authorization");
  if (user.id !== "root") {
    const intents: Intent[] = ["workflowitem.list", "workflowitem.viewHistory"];
    if (
      !(
        Workflowitem.permits(workflowitem, user, [intents[0]]) ||
        Workflowitem.permits(workflowitem, user, [intents[1]])
      )
    ) {
      return new NotAuthorized({ ctx, userId: user.id, intent: intents, target: workflowitem });
    }
  }

  let workflowitemTraceEvents = workflowitem.log;

  if (filter) {
    workflowitemTraceEvents = filterTraceEvents(workflowitemTraceEvents, filter);
  }

  return workflowitemTraceEvents;
};
