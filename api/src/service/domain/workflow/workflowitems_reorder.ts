import isEqual = require("lodash.isequal");

import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as SubprojectEventSourcing from "./subproject_eventsourcing";
import * as WorkflowitemOrdering from "./workflowitem_ordering";
import * as WorkflowitemsReordered from "./workflowitems_reordered";

interface Repository {
  getSubproject(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
}

export async function setWorkflowitemOrdering(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  ordering: WorkflowitemOrdering.WorkflowitemOrdering,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const subproject = await repository.getSubproject(projectId, subprojectId);
  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }
  const currentOrder = subproject.workflowitemOrdering;

  if (isEqual(currentOrder, ordering)) {
    // Ordering hasn't changed, therefore do nothing
    return [];
  }

  const reorderEvent = WorkflowitemsReordered.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    ordering,
  );
  if (Result.isErr(reorderEvent)) {
    return new VError(reorderEvent, "failed to create reorder event");
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "subproject.reorderWorkflowitems";
    if (!Subproject.permits(subproject, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: subproject });
    }
  }

  // Check that the new event is indeed valid:
  const result = SubprojectEventSourcing.newSubprojectFromEvent(ctx, subproject, reorderEvent);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, reorderEvent, [result]);
  }

  // Only emit the event if it causes any changes:
  if (isEqual(subproject.workflowitemOrdering, result.workflowitemOrdering)) {
    return [];
  } else {
    return [reorderEvent];
  }
}
