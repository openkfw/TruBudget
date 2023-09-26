import isEqual = require("lodash.isequal");

import { VError } from "verror";
import Intent from "../../../authz/intents";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemEventSourcing from "./workflowitem_eventsourcing";
import * as WorkflowitemPermissionRevoked from "./workflowitem_permission_revoked";
import logger from "lib/logger";

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
): Promise<Result.Type<BusinessEvent[]>> {
  const workflowitem = await repository.getWorkflowitem(projectId, subprojectId, workflowitemId);

  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  logger.trace(
    { issuer, revokee, intent, projectId, subprojectId, workflowitemId },
    "Creating workflowitem_permission_revoked event",
  );
  const permissionRevoked = WorkflowitemPermissionRevoked.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId,
    intent,
    revokee,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(permissionRevoked)) {
    return new VError(permissionRevoked, "failed to create permission revoked event");
  }

  logger.trace({ issuer }, "Checking if user has permissions");
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

  logger.trace({ event: permissionRevoked }, "Checking event validity");
  const updatedWorkflowitem = WorkflowitemEventSourcing.newWorkflowitemFromEvent(
    ctx,
    workflowitem,
    permissionRevoked,
  );
  if (Result.isErr(updatedWorkflowitem)) {
    return new InvalidCommand(ctx, permissionRevoked, [updatedWorkflowitem]);
  }

  logger.trace("Prevent revoke grant permission on last user");
  const intents: Intent[] = ["workflowitem.intent.grantPermission"];
  if (intent && intents.includes(intent) && workflowitem?.permissions[intent]?.length === 1) {
    return new PreconditionError(
      ctx,
      permissionRevoked,
      `Revoking ${intent} of last user is not allowed.`,
    );
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(workflowitem.permissions, updatedWorkflowitem.permissions)) {
    return [];
  }

  return [permissionRevoked];
}
