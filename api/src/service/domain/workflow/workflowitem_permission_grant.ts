import isEqual = require("lodash.isequal");

import { produce } from "immer";
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
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
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

  if (
    issuer.id !== "root" &&
    !Workflowitem.permits(workflowitem, issuer, ["workflowitem.intent.grantPermission"])
  ) {
    return new NotAuthorized(ctx, issuer.id, permissionGranted);
  }

  // Check that the new event is indeed valid:
  const updatedWorkflowitem = produce(workflowitem, draft =>
    WorkflowitemPermissionGranted.apply(ctx, permissionGranted, draft),
  );
  if (Result.isErr(updatedWorkflowitem)) {
    return new InvalidCommand(ctx, permissionGranted, [updatedWorkflowitem]);
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(workflowitem.permissions, updatedWorkflowitem.permissions)) {
    return { newEvents: [] };
  } else {
    return { newEvents: [permissionGranted] };
  }
}
