import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as Subproject from "./subproject";
import { SubprojectTraceEvent } from "./subproject_trace_event";

interface Repository {
  getSubproject(): Promise<Result.Type<Subproject.Subproject>>;
}

export async function getSubproject(
  ctx: Ctx,
  user: ServiceUser,
  subprojectId: string,
  repository: Repository,
): Promise<Result.Type<Subproject.Subproject>> {
  const subproject = await repository.getSubproject();

  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  if (user.id !== "root") {
    const intents: Intent[] = ["subproject.view"];
    if (!Subproject.permits(subproject, user, intents)) {
      return new NotAuthorized({ ctx, userId: user.id, intent: intents, target: subproject });
    }
  }

  return dropHiddenHistoryEvents(subproject, user);
}

type EventType = string;
const requiredPermissions = new Map<EventType, Intent[]>([
  ["subproject_created", ["subproject.view"]],
  ["subproject_permission_granted", ["subproject.intent.listPermissions"]],
  ["subproject_permission_revoked", ["subproject.intent.listPermissions"]],
  ["subproject_assigned", ["subproject.view"]],
  ["subproject_updated", ["subproject.view"]],
  ["subproject_closed", ["subproject.view"]],
  ["subproject_projected_budget_updated", ["subproject.view"]],
  ["subproject_projected_budget_deleted", ["subproject.view"]],
  ["workflowitems_reordered", ["subproject.reorderWorkflowitems"]],
]);

function dropHiddenHistoryEvents(
  subproject: Subproject.Subproject,
  actingUser: ServiceUser,
): Subproject.Subproject {
  const isEventVisible =
    actingUser.id === "root"
      ? () => true
      : (event: SubprojectTraceEvent) => {
          const allowed = requiredPermissions.get(event.businessEvent.type);
          if (!allowed) return false;
          for (const intent of allowed) {
            for (const identity of subproject.permissions[intent] || []) {
              if (canAssumeIdentity(actingUser, identity)) return true;
            }
          }
          return false;
        };

  return {
    ...subproject,
    log: (subproject.log || []).filter(isEventVisible),
  };
}
