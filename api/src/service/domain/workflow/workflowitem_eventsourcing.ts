import { Ctx } from "../../../lib/ctx";
import deepcopy from "../../../lib/deepcopy";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemClosed from "./workflowitem_closed";
import * as WorkflowitemCreated from "./workflowitem_created";
import { WorkflowitemTraceEvent } from "./workflowitem_trace_event";

export function sourceWorkflowitems(
  ctx: Ctx,
  events: BusinessEvent[],
  origin?: Map<Workflowitem.Id, Workflowitem.Workflowitem>,
): { workflowitems: Workflowitem.Workflowitem[]; errors: EventSourcingError[] } {
  const items =
    origin === undefined
      ? new Map<Workflowitem.Id, Workflowitem.Workflowitem>()
      : new Map<Workflowitem.Id, Workflowitem.Workflowitem>(origin);

  const errors: EventSourcingError[] = [];
  for (const event of events) {
    apply(ctx, items, event, errors);
  }
  return { workflowitems: [...items.values()], errors };
}

function apply(
  ctx: Ctx,
  items: Map<Workflowitem.Id, Workflowitem.Workflowitem>,
  event: BusinessEvent,
  errors: EventSourcingError[],
) {
  switch (event.type) {
    case "workflowitem_created":
      return handleCreate(ctx, items, event, errors);
    case "workflowitem_closed":
      return applyClose(ctx, items, event, errors);
    default:
      // Any other events are ignored.
      return;
  }
}

function handleCreate(
  ctx: Ctx,
  items: Map<Workflowitem.Id, Workflowitem.Workflowitem>,
  workflowitemCreated: WorkflowitemCreated.Event,
  errors: EventSourcingError[],
) {
  const { subprojectId, workflowitem: initialData } = workflowitemCreated;

  let workflowitem = items.get(initialData.id);
  if (workflowitem !== undefined) return;

  workflowitem = {
    ...initialData,
    subprojectId,
    isRedacted: false,
    createdAt: workflowitemCreated.time,
    log: [],
  };

  const result = Workflowitem.validate(workflowitem);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError(ctx, workflowitemCreated, result.message));
    return;
  }

  const traceEvent: WorkflowitemTraceEvent = {
    entityId: workflowitem.id,
    entityType: "workflowitem",
    businessEvent: workflowitemCreated,
    snapshot: {
      displayName: workflowitem.displayName,
      amount: workflowitem.amount,
      currency: workflowitem.currency,
      amountType: workflowitem.amountType,
    },
  };
  workflowitem.log.push(traceEvent);

  items.set(workflowitem.id, workflowitem);
}

function applyClose(
  ctx: Ctx,
  items: Map<Workflowitem.Id, Workflowitem.Workflowitem>,
  workflowitemClosed: WorkflowitemClosed.Event,
  errors: EventSourcingError[],
) {
  const newWorkflowitem = deepcopy(items.get(workflowitemClosed.workflowitemId));
  if (newWorkflowitem === undefined) return;

  // Was the user authorized back then?
  const wasAuthorized = (newWorkflowitem.permissions["workflowitem.close"] || []).includes(
    workflowitemClosed.publisher,
  );
  if (!wasAuthorized) return;

  // Is the change valid wrt. single-item business rules?
  newWorkflowitem.status = "closed";

  const result = Workflowitem.validate(newWorkflowitem);
  if (Result.isErr(result)) {
    errors.push(
      new EventSourcingError(
        ctx,
        workflowitemClosed,
        result.message,
        items.get(workflowitemClosed.workflowitemId),
      ),
    );
    return;
  }

  const traceEvent: WorkflowitemTraceEvent = {
    entityId: newWorkflowitem.id,
    entityType: "workflowitem",
    businessEvent: workflowitemClosed,
    snapshot: {
      displayName: newWorkflowitem.displayName,
      amount: newWorkflowitem.amount,
      currency: newWorkflowitem.currency,
      amountType: newWorkflowitem.amountType,
    },
  };
  newWorkflowitem.log.push(traceEvent);

  items.set(workflowitemClosed.workflowitemId, newWorkflowitem);
}

// export function applyUpdate(event: Event, workflowitem: Workflowitem): true | undefined {
//   if (event.intent !== "workflowitem.update") return;
//   switch (event.dataVersion) {
//     case 1: {
//       if (event.data.documents) {
//         const currentDocs = workflowitem.documents || [];
//         const currentIds = currentDocs.map(doc => doc.id);
//         const newDocs = event.data.documents.filter(doc => !currentIds.includes(doc.id));
//         if (workflowitem.documents) {
//           workflowitem.documents.push(...newDocs);
//         } else {
//           workflowitem.documents = newDocs;
//         }
//         delete event.data.documents;
//       }
//       const update: Update = event.data;

//       inheritDefinedProperties(workflowitem, update);
//       // In case the update has set the amountType to N/A, we don't want to retain the
//       // amount and currency fields:
//       if (workflowitem.amountType === "N/A") {
//         delete workflowitem.amount;
//         delete workflowitem.currency;
//       }

//       return true;
//     }
//   }
//   throwUnsupportedEventVersion(event);
// }

// export function applyAssign(event: Event, workflowitem: Workflowitem): true | undefined {
//   if (event.intent !== "workflowitem.assign") return;
//   switch (event.dataVersion) {
//     case 1: {
//       const { identity } = event.data;
//       workflowitem.assignee = identity;
//       return true;
//     }
//   }
//   throwUnsupportedEventVersion(event);
// }

// export function applyGrantPermission(event: Event, workflowitem: Workflowitem): true | undefined {
//   const permissions = workflowitem.permissions;
//   if (event.intent !== "workflowitem.intent.grantPermission") return;
//   switch (event.dataVersion) {
//     case 1: {
//       const { identity, intent } = event.data;
//       const permissionsForIntent: People = permissions[intent] || [];
//       if (!permissionsForIntent.includes(identity)) {
//         permissionsForIntent.push(identity);
//       }
//       permissions[intent] = permissionsForIntent;
//       return true;
//     }
//   }
//   throwUnsupportedEventVersion(event);
// }

// export function applyRevokePermission(event: Event, workflowitem: Workflowitem): true | undefined {
//   const permissions = workflowitem.permissions;
//   if (event.intent !== "workflowitem.intent.revokePermission") return;
//   switch (event.dataVersion) {
//     case 1: {
//       const { identity, intent } = event.data;
//       const permissionsForIntent: People = permissions[intent] || [];
//       const userIndex = permissionsForIntent.indexOf(identity);
//       if (userIndex !== -1) {
//         // Remove the user from the array:
//         permissionsForIntent.splice(userIndex, 1);
//         permissions[intent] = permissionsForIntent;
//       }
//       return true;
//     }
//   }
//   throwUnsupportedEventVersion(event);
// }
