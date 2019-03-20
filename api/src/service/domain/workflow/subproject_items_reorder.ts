import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as SubprojectItemsReordered from "./subproject_items_reordered";
import * as WorkflowitemOrdering from "./workflowitem_ordering";

import isEqual = require("lodash.isequal");

interface Repository {
  getSubproject(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
}

export async function reorderSubprojectItems(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  ordering: WorkflowitemOrdering.WorkflowitemOrdering,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  const subproject = await repository.getSubproject(projectId, subprojectId);
  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }
  const currentOrder = subproject.workflowitemOrdering;

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
