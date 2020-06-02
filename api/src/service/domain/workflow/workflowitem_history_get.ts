import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "./workflowitem";
import { WorkflowitemTraceEvent } from "./workflowitem_trace_event";
import { NotAuthorized } from "../errors/not_authorized";

export interface Filter {
  publisher: Identity;
  startAt: string; // ISO timestamp
  endAt: string; // ISO timestamp
  eventType: Identity;
}

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
  filter: Filter,
  repository: Repository,
): Promise<Result.Type<WorkflowitemTraceEvent[]>> => {
  const workflowitem = await repository.getWorkflowitem(projectId, subprojectId, workflowitemId);

  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  if (user.id !== "root") {
    const intents: Intent[] = ["workflowitem.view"];
    if (!Workflowitem.permits(workflowitem, user, intents)) {
      return new NotAuthorized({ ctx, userId: user.id, intent: intents, target: workflowitem });
    }
  }

  let workflowitemTraceEvents = workflowitem.log;

  if (filter.publisher) {
    // Publisher id must match exactly
    workflowitemTraceEvents = workflowitemTraceEvents.filter(
      (event) => event.businessEvent.publisher === filter.publisher,
    );
  }

  if (filter.startAt) {
    workflowitemTraceEvents = workflowitemTraceEvents.filter(
      (event) => new Date(event.businessEvent.time) >= new Date(filter.startAt),
    );
  }

  if (filter.endAt) {
    workflowitemTraceEvents = workflowitemTraceEvents.filter(
      (event) => new Date(event.businessEvent.time) <= new Date(filter.endAt),
    );
  }

  if (filter.eventType) {
    // Event type must match exactly
    workflowitemTraceEvents = workflowitemTraceEvents.filter(
      (event) => event.businessEvent.type === filter.eventType,
    );
  }

  return workflowitemTraceEvents;
};
