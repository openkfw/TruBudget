import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import deepcopy from "../../../lib/deepcopy";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as Subproject from "./subproject";
import * as SubprojectAssigned from "./subproject_assigned";
import * as SubprojectClosed from "./subproject_closed";
import * as SubprojectCreated from "./subproject_created";
import * as SubprojectPermissionGranted from "./subproject_permission_granted";
import * as SubprojectPermissionRevoked from "./subproject_permission_revoked";
import * as SubprojectProjectedBudgetDeleted from "./subproject_projected_budget_deleted";
import * as SubprojectProjectedBudgetUpdated from "./subproject_projected_budget_updated";
import { SubprojectTraceEvent } from "./subproject_trace_event";
import * as SubprojectUpdated from "./subproject_updated";
import * as WorkflowitemsReordered from "./workflowitems_reordered";

export function sourceSubprojects(
  ctx: Ctx,
  events: BusinessEvent[],
  origin?: Map<Subproject.Id, Subproject.Subproject>,
): { subprojects: Subproject.Subproject[]; errors: Error[] } {
  const subprojects =
    origin === undefined
      ? new Map<Subproject.Id, Subproject.Subproject>()
      : new Map<Subproject.Id, Subproject.Subproject>(origin);
  const errors: Error[] = [];

  for (const event of events) {
    if (!event.type.startsWith("subproject_") && event.type !== "workflowitems_reordered") {
      continue;
    }

    const subproject = sourceEvent(ctx, event, subprojects);
    if (Result.isErr(subproject)) {
      errors.push(subproject);
    } else {
      subproject.log.push(newTraceEvent(subproject, event));
      subprojects.set(subproject.id, subproject);
    }
  }

  return { subprojects: [...subprojects.values()], errors };
}

function newTraceEvent(
  subproject: Subproject.Subproject,
  event: BusinessEvent,
): SubprojectTraceEvent {
  return {
    entityId: subproject.id,
    entityType: "subproject",
    businessEvent: event,
    snapshot: {
      displayName: subproject.displayName,
    },
  };
}

function sourceEvent(
  ctx: Ctx,
  event: BusinessEvent,
  subprojects: Map<Subproject.Id, Subproject.Subproject>,
): Result.Type<Subproject.Subproject> {
  const subprojectId = getSubprojectId(event);
  let subproject: Result.Type<Subproject.Subproject>;
  if (Result.isOk(subprojectId)) {
    // The event refers to an existing subproject, so
    // the subproject should have been initialized already.

    subproject = get(subprojects, subprojectId);
    if (Result.isErr(subproject)) {
      return new VError(`subproject ID ${subprojectId} found in event ${event.type} is invalid`);
    }

    subproject = newSubprojectFromEvent(ctx, subproject, event);
    if (Result.isErr(subproject)) {
      return subproject; // <- event-sourcing error
    }
  } else {
    // The event does not refer to a subproject ID, so it must be a creation event:
    if (event.type !== "subproject_created") {
      return new VError(
        `event ${event.type} is not of type "subproject_created" but also ` +
          "does not include a subproject ID",
      );
    }

    subproject = SubprojectCreated.createFrom(ctx, event);
    if (Result.isErr(subproject)) {
      return new VError(subproject, "could not create subproject from event");
    }
  }

  return subproject;
}

function get(
  subprojects: Map<Subproject.Id, Subproject.Subproject>,
  subprojectId: Subproject.Id,
): Result.Type<Subproject.Subproject> {
  const subproject = subprojects.get(subprojectId);
  if (subproject === undefined) {
    return new VError(`subproject ${subprojectId} not yet initialized`);
  }
  return subproject;
}

function getSubprojectId(event: BusinessEvent): Result.Type<Subproject.Id> {
  switch (event.type) {
    case "subproject_updated":
    case "subproject_assigned":
    case "subproject_closed":
    case "subproject_permission_granted":
    case "subproject_permission_revoked":
    case "subproject_projected_budget_updated":
    case "subproject_projected_budget_deleted":
    case "workflowitems_reordered":
      return event.subprojectId;

    default:
      return new VError(`cannot find subproject ID in event of type ${event.type}`);
  }
}

/** Returns a new subproject with the given event applied, or an error. */
export function newSubprojectFromEvent(
  ctx: Ctx,
  subproject: Subproject.Subproject,
  event: BusinessEvent,
): Result.Type<Subproject.Subproject> {
  const eventModule = getEventModule(event);
  if (Result.isErr(eventModule)) {
    return eventModule;
  }
  // Ensure that we never modify subproject or event in-place by passing copies. When
  // copying the subproject, its event log is omitted for performance reasons.
  const eventCopy = deepcopy(event);
  const subprojectCopy = copySubprojectExceptLog(subproject);

  // Apply the event to the copied subproject:
  const mutationResult = eventModule.mutate(subprojectCopy, eventCopy);
  if (Result.isErr(mutationResult)) {
    return new EventSourcingError({ ctx, event, target: subproject }, mutationResult);
  }

  // Validate the modified subproject:
  const validationResult = Subproject.validate(subprojectCopy);
  if (Result.isErr(validationResult)) {
    return new EventSourcingError({ ctx, event, target: subproject }, validationResult);
  }

  // Restore the event log:
  subprojectCopy.log = subproject.log;

  // Return the modified (and validated) subproject:
  return subprojectCopy;
}

type EventModule = {
  mutate: (subproject: Subproject.Subproject, event: BusinessEvent) => Result.Type<void>;
};
function getEventModule(event: BusinessEvent): Result.Type<EventModule> {
  switch (event.type) {
    case "subproject_updated":
      return SubprojectUpdated;

    case "subproject_assigned":
      return SubprojectAssigned;

    case "subproject_closed":
      return SubprojectClosed;

    case "subproject_permission_granted":
      return SubprojectPermissionGranted;

    case "subproject_permission_revoked":
      return SubprojectPermissionRevoked;

    case "subproject_projected_budget_updated":
      return SubprojectProjectedBudgetUpdated;

    case "subproject_projected_budget_deleted":
      return SubprojectProjectedBudgetDeleted;

    case "workflowitems_reordered":
      return WorkflowitemsReordered;

    default:
      return new VError(`unknown subproject event ${event.type}`);
  }
}

function copySubprojectExceptLog(subproject: Subproject.Subproject): Subproject.Subproject {
  const { log, ...tmp } = subproject;
  const copy = deepcopy(tmp);
  (copy as any).log = [];
  return copy as Subproject.Subproject;
}
