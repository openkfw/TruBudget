import { produce as withCopy } from "immer";

import { Ctx } from "../../../lib/ctx";
import deepcopy from "../../../lib/deepcopy";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemClosed from "./workflowitem_closed";
import * as WorkflowitemCreated from "./workflowitem_created";
import * as WorkflowitemAssigned from "./workflowitem_assigned";
import * as WorkflowitemPermissionGranted from "./workflowitem_permission_granted";
import * as WorkflowitemPermissionRevoked from "./workflowitem_permission_revoked";
import * as WorkflowitemUpdated from "./workflowitem_updated";
import { WorkflowitemTraceEvent } from "./workflowitem_trace_event";

export function sourceWorkflowitems(
  ctx: Ctx,
  events: BusinessEvent[],
  origin?: Map<Workflowitem.Id, Workflowitem.Workflowitem>,
): { workflowitems: Workflowitem.Workflowitem[]; errors: Error[] } {
  const items =
    origin === undefined
      ? new Map<Workflowitem.Id, Workflowitem.Workflowitem>()
      : new Map<Workflowitem.Id, Workflowitem.Workflowitem>(origin);

  const errors: Error[] = [];
  for (const event of events) {
    if (!event.type.startsWith("workflowitem_")) {
      continue;
    }
    const result = applyWorkflowitemEvents(ctx, items, event);
    if (Result.isErr(result)) {
      errors.push(result);
    } else {
      result.log.push(newTraceEvent(result, event));
      items.set(result.id, result);
    }
  }

  return { workflowitems: [...items.values()], errors };
}

function applyWorkflowitemEvents(
  ctx: Ctx,
  items: Map<Workflowitem.Id, Workflowitem.Workflowitem>,
  event: BusinessEvent,
): Result.Type<Workflowitem.Workflowitem> {
  switch (event.type) {
    case "workflowitem_assigned":
      return apply(ctx, event, items, event.workflowitemId, WorkflowitemAssigned);
    case "workflowitem_closed":
      return apply(ctx, event, items, event.workflowitemId, WorkflowitemClosed);
    case "workflowitem_created":
      return WorkflowitemCreated.createFrom(ctx, event);
    case "workflowitem_permission_granted":
      return apply(ctx, event, items, event.workflowitemId, WorkflowitemPermissionGranted);
    case "workflowitem_permission_revoked":
      return apply(ctx, event, items, event.workflowitemId, WorkflowitemPermissionRevoked);
    case "workflowitem_updated":
      return apply(ctx, event, items, event.workflowitemId, WorkflowitemUpdated);
    default:
      throw Error(`not implemented: ${event.type}`);
  }
}

type ApplyFn = (
  ctx: Ctx,
  event: BusinessEvent,
  workflowitem: Workflowitem.Workflowitem,
) => Result.Type<Workflowitem.Workflowitem>;
function apply(
  ctx: Ctx,
  event: BusinessEvent,
  projects: Map<Workflowitem.Id, Workflowitem.Workflowitem>,
  projectId: string,
  eventModule: { apply: ApplyFn },
) {
  const project = projects.get(projectId);
  if (project === undefined) {
    return new EventSourcingError(ctx, event, "not found", projectId);
  }

  try {
    return withCopy(project, draft => {
      const result = eventModule.apply(ctx, event, draft);
      if (Result.isErr(result)) {
        throw result;
      }
      return result;
    });
  } catch (err) {
    return err;
  }
}

function newTraceEvent(
  workflowitem: Workflowitem.Workflowitem,
  event: BusinessEvent,
): WorkflowitemTraceEvent {
  return {
    entityId: workflowitem.id,
    entityType: "workflowitem",
    businessEvent: event,
    snapshot: {
      displayName: workflowitem.displayName,
      amount: workflowitem.amount,
      currency: workflowitem.currency,
      amountType: workflowitem.amountType,
    },
  };
}
