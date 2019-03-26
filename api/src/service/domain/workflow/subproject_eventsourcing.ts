import { produce } from "immer";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as Subproject from "./subproject";
import * as SubprojectAssigned from "./subproject_assigned";
import * as SubprojectClosed from "./subproject_closed";
import * as SubprojectCreated from "./subproject_created";
import * as SubprojectItemsReordered from "./subproject_items_reordered";
import * as SubprojectPermissionGranted from "./subproject_permission_granted";
import * as SubprojectPermissionRevoked from "./subproject_permission_revoked";
import * as SubprojectProjectedBudgetDeleted from "./subproject_projected_budget_deleted";
import * as SubprojectProjectedBudgetUpdated from "./subproject_projected_budget_updated";
import { SubprojectTraceEvent } from "./subproject_trace_event";
import * as SubprojectUpdated from "./subproject_updated";
import logger from "../../../lib/logger";

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
    if (!event.type.startsWith("subproject_")) {
      continue;
    }
    if (event.type === "subproject_permission_granted") {
      logger.fatal("granted");
      logger.fatal(event);
    }
    const result = applySubprojectEvent(ctx, subprojects, event);
    if (Result.isErr(result)) {
      logger.warn(result);
      errors.push(result);
    } else {
      result.log.push(newTraceEvent(result, event));
      subprojects.set(result.id, result);
    }
  }

  return { subprojects: [...subprojects.values()], errors };
}

function applySubprojectEvent(
  ctx: Ctx,
  subprojects: Map<Subproject.Id, Subproject.Subproject>,
  event: BusinessEvent,
): Result.Type<Subproject.Subproject> {
  switch (event.type) {
    case "subproject_created":
      return SubprojectCreated.createFrom(ctx, event);

    case "subproject_updated":
      return apply(ctx, event, subprojects, event.subprojectId, SubprojectUpdated);

    case "subproject_assigned":
      return apply(ctx, event, subprojects, event.subprojectId, SubprojectAssigned);

    case "subproject_closed":
      return apply(ctx, event, subprojects, event.subprojectId, SubprojectClosed);

    case "subproject_items_reordered":
      return apply(ctx, event, subprojects, event.subprojectId, SubprojectItemsReordered);

    case "subproject_permission_granted":
      return apply(ctx, event, subprojects, event.subprojectId, SubprojectPermissionGranted);

    case "subproject_permission_revoked":
      return apply(ctx, event, subprojects, event.subprojectId, SubprojectPermissionRevoked);

    case "subproject_projected_budget_updated":
      return apply(ctx, event, subprojects, event.subprojectId, SubprojectProjectedBudgetUpdated);

    case "subproject_projected_budget_deleted":
      return apply(ctx, event, subprojects, event.subprojectId, SubprojectProjectedBudgetDeleted);

    default:
      return Error(`not implemented!!!!!!!!!!!!!!!: ${event.type}`);
  }
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

type ApplyFn = (
  ctx: Ctx,
  event: BusinessEvent,
  subproject: Subproject.Subproject,
) => Result.Type<Subproject.Subproject>;

export function apply(
  ctx: Ctx,
  event: BusinessEvent,
  subprojects: Map<Subproject.Id, Subproject.Subproject>,
  subprojectId: string,
  eventModule: { apply: ApplyFn },
) {
  const subproject = subprojects.get(subprojectId);
  if (subproject === undefined) {
    return new EventSourcingError(ctx, event, "not found", subprojectId);
  }

  try {
    return produce(subproject, draft => {
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
