import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "./workflowitem";
import { sourceWorkflowitems } from "./workflowitem_eventsourcing";
import { WorkflowitemTraceEvent } from "./workflowitem_trace_event";
import * as Result from "../../../result";
import * as Project from "./project";
import * as Subroject from "./subproject";
import { NotFound } from "../errors/not_found";

interface Repository {
  getWorkflowitems(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem[]>>;
}

export async function getAllVisible(
  ctx: Ctx,
  user: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subroject.Id,
  repository: Repository,
): Promise<Result.Type<Workflowitem.Workflowitem[]>> {
  const workflowitems = await repository.getWorkflowitems(projectId, subprojectId);

  if (Result.isErr(workflowitems)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  const isVisible =
    user.id === "root"
      ? () => true
      : (workflowitem: Workflowitem.Workflowitem) =>
          Workflowitem.permits(workflowitem, user, ["workflowitem.view"]);

  const removeNonvisibleHistory = (workflowitem: Workflowitem.Workflowitem) =>
    dropHiddenHistoryEvents(workflowitem, user);

  const visibleWorkflowitems = workflowitems.filter(isVisible).map(removeNonvisibleHistory);
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
