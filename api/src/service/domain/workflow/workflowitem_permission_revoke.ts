import isEqual = require("lodash.isequal");

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemEventSourcing from "./workflowitem_eventsourcing";
import * as WorkflowitemPermissionRevoked from "./workflowitem_permission_revoked";

interface Repository {
  getWorkflowitem(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    workflowitemId: Workflowitem.Id,
  ): Promise<Result.Type<Workflowitem.Workflowitem>>;
}

export async function revokeWorkflowitemPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  revokee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  const workflowitem = await repository.getWorkflowitem(projectId, subprojectId, workflowitemId);

  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  // Create the new event:
  const permissionRevoked = WorkflowitemPermissionRevoked.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId,
    intent,
    revokee,
  );

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const revokeIntent = "workflowitem.intent.revokePermission";
    if (!Workflowitem.permits(workflowitem, issuer, [revokeIntent])) {
      return new NotAuthorized({
        ctx,
        userId: issuer.id,
        intent: revokeIntent,
        target: workflowitem,
      });
    }
  }

  // Check that the new event is indeed valid:
  const updatedWorkflowitem = WorkflowitemEventSourcing.newWorkflowitemFromEvent(
    ctx,
    workflowitem,
    permissionRevoked,
  );
  if (Result.isErr(updatedWorkflowitem)) {
    return new InvalidCommand(ctx, permissionRevoked, [updatedWorkflowitem]);
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(workflowitem.permissions, updatedWorkflowitem.permissions)) {
    return { newEvents: [] };
  } else {
    return { newEvents: [permissionRevoked] };
  }
}
