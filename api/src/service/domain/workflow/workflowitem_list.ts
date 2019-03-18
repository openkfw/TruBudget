import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "./workflowitem";
import { sourceWorkflowitems } from "./workflowitem_eventsourcing";
import { WorkflowitemTraceEvent } from "./workflowitem_trace_event";

interface Repository {
  getAllWorkflowitemEvents(): Promise<BusinessEvent[]>;
}

export async function getAllVisible(
  ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<Workflowitem.Workflowitem[]> {
  const allWorkflowitemEvents = await repository.getAllWorkflowitemEvents();
  const { workflowitems: allWorkflowitems } = sourceWorkflowitems(ctx, allWorkflowitemEvents);

  const isVisible =
    user.id === "root"
      ? () => true
      : (workflowitem: Workflowitem.Workflowitem) =>
          Workflowitem.permits(workflowitem, user, ["workflowitem.view"]);

  const removeNonvisibleHistory = (workflowitem: Workflowitem.Workflowitem) =>
    dropHiddenHistoryEvents(workflowitem, user);

  const visibleWorkflowitems = allWorkflowitems.filter(isVisible).map(removeNonvisibleHistory);
  return visibleWorkflowitems;
}

type EventType = string;
const requiredPermissions = new Map<EventType, Intent[]>([
  [" workflowitem_created", ["workflowitem.view"]],
  [" workflowitem_permission_granted", ["workflowitem.intent.listPermissions"]],
  [" workflowitem_permission_revoked", ["workflowitem.intent.listPermissions"]],
  [" workflowitem_assigned", ["workflowitem.view"]],
  [" workflowitem_updated", ["workflowitem.view"]],
  [" workflowitem_closed", ["workflowitem.view"]],
  [" workflowitem_reordered", ["workflowitem.view"]],
]);

function dropHiddenHistoryEvents(
  workflowitem: Workflowitem.Workflowitem,
  actingUser: ServiceUser,
): Workflowitem.Workflowitem {
  const isEventVisible =
    actingUser.id === "root"
      ? () => true
      : (event: WorkflowitemTraceEvent) => {
          const allowed = requiredPermissions.get(event.businessEvent.type);
          if (!allowed) return false;
          for (const intent of allowed) {
            for (const identity of workflowitem.permissions[intent] || []) {
              if (canAssumeIdentity(actingUser, identity)) return true;
            }
          }
          return false;
        };

  return {
    ...workflowitem,
    log: (workflowitem.log || []).filter(isEventVisible),
  };
}
