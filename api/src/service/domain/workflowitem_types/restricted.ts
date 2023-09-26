import { VError } from "verror";

import { workflowitemIntents } from "../../../authz/intents";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "../workflow/workflowitem";
import * as WorkflowitemPermissionGranted from "../workflow/workflowitem_permission_granted";
import * as WorkflowitemPermissionRevoked from "../workflow/workflowitem_permission_revoked";

export const createEvents = (
  originEvent: BusinessEvent,
  ctx: Ctx,
  publisher: ServiceUser,
  workflowitem: Workflowitem.Workflowitem,
): Result.Type<BusinessEvent[]> => {
  switch (originEvent.type) {
    case "workflowitem_assigned":
      return createPermissionEvents(
        originEvent.projectId,
        originEvent.subprojectId,
        originEvent.workflowitemId,
        originEvent.assignee,
        ctx,
        publisher,
        workflowitem,
      );
    case "workflowitem_created":
      return createPermissionEvents(
        originEvent.projectId,
        originEvent.subprojectId,
        originEvent.workflowitem.id,
        originEvent.workflowitem.assignee,
        ctx,
        publisher,
        workflowitem,
      );
    default:
      return [];
  }
};

const createPermissionEvents = (
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  assignee: Identity,
  ctx: Ctx,
  issuer: ServiceUser,
  workflowitem: Workflowitem.Workflowitem,
): Result.Type<BusinessEvent[]> => {
  const revokeIntent = "workflowitem.intent.revokePermission";
  const grantIntent = "workflowitem.intent.grantPermission";

  // Create events for all workflowitem intents
  const permissionsGranted: Result.Type<WorkflowitemPermissionGranted.Event[]> = [];
  for (const intent of workflowitemIntents) {
    const createEventResult = WorkflowitemPermissionGranted.createEvent(
      ctx.source,
      issuer.id,
      projectId,
      subprojectId,
      workflowitemId,
      intent,
      assignee,
      new Date().toISOString(),
      issuer.metadata,
    );
    if (Result.isErr(createEventResult)) {
      return new VError(createEventResult, "failed to create permission grant event");
    }
    permissionsGranted.push(createEventResult);
  }

  const permissionRevokedEvents: Result.Type<WorkflowitemPermissionRevoked.Event[]> = [];
  if (assignee !== issuer.id) {
    for (const intent of workflowitemIntents) {
      if (intent !== "workflowitem.list") {
        const createEventResult = WorkflowitemPermissionRevoked.createEvent(
          ctx.source,
          issuer.id,
          projectId,
          subprojectId,
          workflowitemId,
          intent,
          issuer.id,
          new Date().toISOString(),
          issuer.metadata,
        );
        if (Result.isErr(createEventResult)) {
          return new VError(createEventResult, "failed to create permission revoke event");
        }
        permissionRevokedEvents.push(createEventResult);
      }
    }
  }
  // Split the permission "revoked" Events into revoke intents and other intents,
  // because the event for the revoke intent should be applied at last to avoid insufficient permissions errors
  // Note that the events in revokePermissionRevokedEvents are events which revoke a "revoke"-permission.
  const [otherPermissionRevokedEvents, revokePermissionRevokedEvents] =
    permissionRevokedEvents.reduce(
      ([otherRevokedEvents, revokeRevokedEvents], event) =>
        event.permission !== revokeIntent
          ? [[...revokeRevokedEvents, event], otherRevokedEvents]
          : [otherRevokedEvents, [...revokeRevokedEvents, event]],
      [[] as WorkflowitemPermissionRevoked.Event[], [] as WorkflowitemPermissionRevoked.Event[]],
    );

  // Check authorization
  if (issuer.id !== "root") {
    if (!Workflowitem.permits(workflowitem, issuer, [grantIntent])) {
      let hasRevokePermissions = true;
      if (!Workflowitem.permits(workflowitem, issuer, [revokeIntent])) {
        hasRevokePermissions = false;
      }
      return new NotAuthorized({
        ctx,
        userId: issuer.id,
        intent: hasRevokePermissions ? grantIntent : revokeIntent,
        target: workflowitem,
      });
    }
  }

  return [...permissionsGranted, ...otherPermissionRevokedEvents, ...revokePermissionRevokedEvents];
};
