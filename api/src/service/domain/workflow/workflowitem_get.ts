import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
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

  logger.trace({ user }, "Checking user authorization");
  if (user.id !== "root") {
    const intent = "workflowitem.list";
    if (!Workflowitem.permits(workflowitem, user, [intent])) {
      return new NotAuthorized({ ctx, userId: user.id, intent, target: workflowitem });
    }
  }

  return dropHiddenHistoryEvents(workflowitem, user);
}

type EventType = string;
const requiredPermissions = new Map<EventType, Intent[]>([
  ["workflowitem_created", ["workflowitem.list"]],
  ["workflowitem_permission_granted", ["workflowitem.intent.listPermissions"]],
  ["workflowitem_permission_revoked", ["workflowitem.intent.listPermissions"]],
  ["workflowitem_assigned", ["workflowitem.list"]],
  ["workflowitem_updated", ["workflowitem.list"]],
  ["workflowitem_closed", ["workflowitem.list"]],
  ["workflowitem_projected_budget_updated", ["workflowitem.list"]],
  ["workflowitem_projected_budget_deleted", ["workflowitem.list"]],
]);

function dropHiddenHistoryEvents(
  workflowitem: Workflowitem.Workflowitem,
  actingUser: ServiceUser,
): Workflowitem.Workflowitem {
  const isEventVisible =
    actingUser.id === "root"
      ? (): boolean => true
      : (event: WorkflowitemTraceEvent): boolean => {
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
