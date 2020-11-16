import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import deepcopy from "../../../lib/deepcopy";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemAssigned from "./workflowitem_assigned";
import * as WorkflowitemClosed from "./workflowitem_closed";
import * as WorkflowitemCreated from "./workflowitem_created";
import * as WorkflowitemPermissionGranted from "./workflowitem_permission_granted";
import * as WorkflowitemPermissionRevoked from "./workflowitem_permission_revoked";
import { WorkflowitemTraceEvent } from "./workflowitem_trace_event";
import * as WorkflowitemUpdated from "./workflowitem_updated";

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

    const workflowitem = sourceEvent(ctx, event, items);
    if (Result.isErr(workflowitem)) {
      errors.push(workflowitem);
    } else {
      workflowitem.log.push(newTraceEvent(workflowitem, event));
      items.set(workflowitem.id, workflowitem);
    }
  }

  return { workflowitems: [...items.values()], errors };
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

function sourceEvent(
  ctx: Ctx,
  event: BusinessEvent,
  workflowitems: Map<Workflowitem.Id, Workflowitem.Workflowitem>,
): Result.Type<Workflowitem.Workflowitem> {
  const workflowitemId = getWorkflowitemId(event);
  let workflowitem: Result.Type<Workflowitem.Workflowitem>;
  if (Result.isOk(workflowitemId)) {
    // The event refers to an existing workflowitem, so
    // the workflowitem should have been initialized already.

    workflowitem = get(workflowitems, workflowitemId);
    if (Result.isErr(workflowitem)) {
      return new VError(
        `workflowitem ID ${workflowitemId} found in event ${event.type} is invalid`,
      );
    }

    workflowitem = newWorkflowitemFromEvent(ctx, workflowitem, event);
    if (Result.isErr(workflowitem)) {
      return workflowitem; // <- event-sourcing error
    }
  } else {
    // The event does not refer to a workflowitem ID, so it must be a creation event:
    if (event.type !== "workflowitem_created") {
      return new VError(
        `event ${event.type} is not of type "workflowitem_created" but also ` +
          "does not include a workflowitem ID",
      );
    }

    workflowitem = WorkflowitemCreated.createFrom(ctx, event);
    if (Result.isErr(workflowitem)) {
      return new VError(workflowitem, "could not create workflowitem from event");
    }
  }

  return workflowitem;
}

function get(
  workflowitems: Map<Workflowitem.Id, Workflowitem.Workflowitem>,
  workflowitemId: Workflowitem.Id,
): Result.Type<Workflowitem.Workflowitem> {
  const workflowitem = workflowitems.get(workflowitemId);
  if (workflowitem === undefined) {
    return new VError(`workflowitem ${workflowitemId} not yet initialized`);
  }
  return workflowitem;
}

function getWorkflowitemId(event: BusinessEvent): Result.Type<Workflowitem.Id> {
  switch (event.type) {
    case "workflowitem_updated":
    case "workflowitem_assigned":
    case "workflowitem_closed":
    case "workflowitem_permission_granted":
    case "workflowitem_permission_revoked":
      return event.workflowitemId;

    default:
      return new VError(`cannot find workflowitem ID in event of type ${event.type}`);
  }
}

/** Returns a new workflowitem with the given event applied, or an error. */
export function newWorkflowitemFromEvent(
  ctx: Ctx,
  workflowitem: Workflowitem.Workflowitem,
  event: BusinessEvent,
): Result.Type<Workflowitem.Workflowitem> {
  const eventModule = getEventModule(event);
  if (Result.isErr(eventModule)) {
    return eventModule;
  }

  // Ensure that we never modify workflowitem or event in-place by passing copies. When
  // copying the workflowitem, its event log is omitted for performance reasons.
  const eventCopy = deepcopy(event);
  const workflowitemCopy = copyWorkflowitemExceptLog(workflowitem);

  // Apply the event to the copied workflowitem:
  const mutationResult = eventModule.mutate(workflowitemCopy, eventCopy);
  if (Result.isErr(mutationResult)) {
    return new VError(
      new EventSourcingError({ ctx, event, target: workflowitem }, mutationResult),
      "mutation of workflowitem failed",
    );
  }

  // Validate the modified workflowitem:
  const validationResult = Workflowitem.validate(workflowitemCopy);
  if (Result.isErr(validationResult)) {
    return new VError(
      new EventSourcingError({ ctx, event, target: workflowitem }, validationResult),
      "validation of workflowitem failed",
    );
  }

  // Restore the event log:
  workflowitemCopy.log = workflowitem.log;

  // Return the modified (and validated) workflowitem:
  return workflowitemCopy;
}

type EventModule = {
  mutate: (workflowitem: Workflowitem.Workflowitem, event: BusinessEvent) => Result.Type<void>;
};
function getEventModule(event: BusinessEvent): Result.Type<EventModule> {
  switch (event.type) {
    case "workflowitem_updated":
      return WorkflowitemUpdated;

    case "workflowitem_assigned":
      return WorkflowitemAssigned;

    case "workflowitem_closed":
      return WorkflowitemClosed;

    case "workflowitem_permission_granted":
      return WorkflowitemPermissionGranted;

    case "workflowitem_permission_revoked":
      return WorkflowitemPermissionRevoked;

    default:
      return new VError(`unknown workflowitem event ${event.type}`);
  }
}

function copyWorkflowitemExceptLog(
  workflowitem: Workflowitem.Workflowitem,
): Workflowitem.Workflowitem {
  const { log, ...tmp } = workflowitem;
  const copy = deepcopy(tmp);
  (copy as any).log = [];
  return copy as Workflowitem.Workflowitem;
}
