import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "./workflowitem";
import { WorkflowitemTraceEvent } from "./workflowitem_trace_event";

interface Repository {
  getWorkflowitem(): Promise<Result.Type<Workflowitem.Workflowitem>>;
}

export async function getWorkflowitem(
  ctx: Ctx,
  user: ServiceUser,
  workflowitemId: string,
  repository: Repository,
): Promise<Result.Type<Workflowitem.Workflowitem>> {
  const workflowitem = await repository.getWorkflowitem();
  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  if (user.id !== "root") {
    const intent = "workflowitem.view";
    if (!Workflowitem.permits(workflowitem, user, [intent])) {
      return new NotAuthorized({ ctx, userId: user.id, intent, target: workflowitem });
    }
  }

  return dropHiddenHistoryEvents(workflowitem, user);
}

type EventType = string;
const requiredPermissions = new Map<EventType, Intent[]>([
  ["workflowitem_created", ["workflowitem.view"]],
  ["workflowitem_permission_granted", ["workflowitem.intent.listPermissions"]],
  ["workflowitem_permission_revoked", ["workflowitem.intent.listPermissions"]],
  ["workflowitem_assigned", ["workflowitem.view"]],
  ["workflowitem_updated", ["workflowitem.view"]],
  ["workflowitem_closed", ["workflowitem.view"]],
  ["workflowitem_archived", ["workflowitem.view"]],
  ["workflowitem_projected_budget_updated", ["workflowitem.view"]],
  ["workflowitem_projected_budget_deleted", ["workflowitem.view"]],
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
