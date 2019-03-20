import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as NotificationCreated from "./notification_created";
import * as Project from "./project";
import * as ProjectClosed from "./project_closed";
import * as SubprojectItemsReordered from "./subproject_items_reordered";
import * as Subproject from "./subproject";
import { getWorkflowitemFromList } from "../../../workflowitem";
import * as WorkflowitemOrdering from "./workflowitem_ordering";
import isEqual = require("lodash.isequal");
import { canAssumeIdentity } from "../organization/auth_token";

interface Repository {
  getWorkflowitemOrdering(projectId: string, subprojectId: string): Promise<Result.Type<string[]>>;
  getSubproject(subprojectId: string): Promise<Result.Type<Subproject.Subproject>>;
}

export async function reorderSubprojectItems(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  ordering: WorkflowitemOrdering.WorkflowitemOrdering,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  const currentOrder = await repository.getWorkflowitemOrdering(projectId, subprojectId);

  if (Result.isErr(currentOrder)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  if (isEqual(currentOrder, ordering)) {
    // Ordering hasn't changed, therefore do nothing
    return { newEvents: [] };
  }

  const reorderEvent = SubprojectItemsReordered.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    ordering,
  );

  const subproject = await repository.getSubproject(subprojectId);
  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const isAuthorized = (subproject.permissions["subproject.reorderWorkflowitems"] || []).some(
      identity => canAssumeIdentity(issuer, identity),
    );
    if (!isAuthorized) {
      return new NotAuthorized(ctx, issuer.id, reorderEvent);
    }
  }

  // Check that the new event is indeed valid:
  const result = SubprojectItemsReordered.apply(ctx, reorderEvent, subproject);

  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, reorderEvent, [result]);
  }

  return { newEvents: [reorderEvent] };
}
