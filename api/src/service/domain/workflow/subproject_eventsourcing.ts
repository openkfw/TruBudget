import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as Subproject from "./subproject";
import * as SubprojectCreated from "./subproject_created";
import { SubprojectTraceEvent } from "./subproject_trace_event";

export function sourceSubprojects(
  ctx: Ctx,
  events: BusinessEvent[],
  origin?: Map<Subproject.Id, Subproject.Subproject>,
): { subprojects: Subproject.Subproject[]; errors: EventSourcingError[] } {
  const subprojects =
    origin === undefined
      ? new Map<Subproject.Id, Subproject.Subproject>()
      : new Map<Subproject.Id, Subproject.Subproject>(origin);

  const errors: EventSourcingError[] = [];
  for (const event of events) {
    apply(ctx, subprojects, event, errors);
  }
  return { subprojects: [...subprojects.values()], errors };
}

function apply(
  ctx: Ctx,
  subprojects: Map<Subproject.Id, Subproject.Subproject>,
  event: BusinessEvent,
  errors: EventSourcingError[],
) {
  if (event.type === "subproject_created") {
    handleCreate(ctx, subprojects, event, errors);
  }
}

function handleCreate(
  ctx: Ctx,
  subprojects: Map<Subproject.Id, Subproject.Subproject>,
  subprojectCreated: SubprojectCreated.Event,
  errors: EventSourcingError[],
) {
  const { projectId, subproject: initialData } = subprojectCreated;

  let subproject = subprojects.get(initialData.id);
  if (subproject !== undefined) return;

  subproject = {
    ...initialData,
    projectId,
    createdAt: subprojectCreated.time,
    log: [],
  };

  const result = Subproject.validate(subproject);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError(ctx, subprojectCreated, result.message));
    return;
  }

  const traceEvent: SubprojectTraceEvent = {
    entityId: subproject.id,
    entityType: "subproject",
    businessEvent: subprojectCreated,
    snapshot: {
      displayName: subproject.displayName,
    },
  };
  subproject.log.push(traceEvent);

  subprojects.set(subproject.id, subproject);
}
