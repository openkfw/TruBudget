import { workflowitemIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
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
  publisher: ServiceUser,
  workflowitem: Workflowitem.Workflowitem,
): Result.Type<BusinessEvent[]> => {
  const revokeIntent = "workflowitem.intent.revokePermission";
  const grantIntent = "workflowitem.intent.grantPermission";

  // Create events for all workflowitem intents
  const permissionsGranted = workflowitemIntents.map(intent =>
    WorkflowitemPermissionGranted.createEvent(
      ctx.source,
      publisher.id,
      projectId,
      subprojectId,
      workflowitemId,
      intent,
      assignee,
    ),
  );

  let permissionsRevoked = workflowitemIntents
    .filter(intent => intent !== "workflowitem.view")
    .map(intent =>
      WorkflowitemPermissionRevoked.createEvent(
        ctx.source,
        publisher.id,
        projectId,
        subprojectId,
        workflowitemId,
        intent,
        publisher.id,
      ),
    );

  // The permission for the revokeIntent should be revoked at last
  const revokeIntentPermission = permissionsRevoked.filter(event => event.permission === revokeIntent);
  permissionsRevoked = permissionsRevoked.filter(event => event.permission !== revokeIntent);

  // Check authorization
  if (publisher.id !== "root") {
    if (!Workflowitem.permits(workflowitem, publisher, [grantIntent])) {
      let hasRevokePermissions = true;
      if (!Workflowitem.permits(workflowitem, publisher, [revokeIntent])) {
        hasRevokePermissions = false;
      }
      return new NotAuthorized({
        ctx,
        userId: publisher.id,
        intent: hasRevokePermissions ? grantIntent : revokeIntent,
        target: workflowitem,
      });
    }
  }

  return [...permissionsGranted, ...permissionsRevoked, ...revokeIntentPermission];
};
