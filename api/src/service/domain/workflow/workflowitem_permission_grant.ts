import isEqual = require("lodash.isequal");

import { VError } from "verror";
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
import * as WorkflowitemPermissionGranted from "./workflowitem_permission_granted";

interface Repository {
  getWorkflowitem(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    workflowitemId: Workflowitem.Id,
  ): Promise<Result.Type<Workflowitem.Workflowitem>>;
}

export async function grantWorkflowitemPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  grantee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const workflowitem = await repository.getWorkflowitem(projectId, subprojectId, workflowitemId);
  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  // Create the new event:
  const permissionGranted = WorkflowitemPermissionGranted.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId,
    intent,
    grantee,
  );
  if (Result.isErr(permissionGranted)) {
    return new VError(permissionGranted, "failed to create permission granted event");
  }

  if (issuer.id !== "root") {
    const grantIntent = "workflowitem.intent.grantPermission";
    if (!Workflowitem.permits(workflowitem, issuer, [grantIntent])) {
      return new NotAuthorized({
        ctx,
        userId: issuer.id,
        intent: grantIntent,
        target: workflowitem,
      });
    }
  }

  // Check that the new event is indeed valid:
  const updatedWorkflowitem = WorkflowitemEventSourcing.newWorkflowitemFromEvent(
    ctx,
    workflowitem,
    permissionGranted,
  );
  if (Result.isErr(updatedWorkflowitem)) {
    return new InvalidCommand(ctx, permissionGranted, [updatedWorkflowitem]);
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(workflowitem.permissions, updatedWorkflowitem.permissions)) {
    return [];
  } else {
    return [permissionGranted];
  }
}
