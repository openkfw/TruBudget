import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemAssigned from "./workflowitem_assigned";
import { sourceWorkflowitems } from "./workflowitem_eventsourcing";

// do we source all the time or can we pass the workflow to close into this function?

export function assignWorkflowitem(
  ctx: Ctx,
  assigningUser: ServiceUser,
  assignee: UserRecord.Id,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  allSubprojectWorkflowitemEvents: BusinessEvent[],
): { newEvents: BusinessEvent[]; errors: Error[] } {
  const { workflowitems: items } = sourceWorkflowitems(ctx, allSubprojectWorkflowitemEvents);

  const workflowItemToBeAssigned = items.find(item => item.id === workflowitemId);
  if (workflowItemToBeAssigned === undefined) {
    return {
      newEvents: [],
      errors: [
        new VError(
          new NotFound(ctx, "workflowitem", workflowitemId),
          `Couldn't assign ${assignee} to workflowitem ${workflowitemId}. Workflowitem not found!`,
        ),
      ],
    };
  }

  const publisher = assigningUser.id;
  const assignEvent = WorkflowitemAssigned.createEvent(
    ctx.source,
    publisher,
    projectId,
    subprojectId,
    workflowitemId,
    assignee,
  );
  // Dont re-assign to the same user

  if (assignee === workflowItemToBeAssigned.assignee) {
    return {
      newEvents: [],
      errors: [
        new PreconditionError(
          ctx,
          assignEvent,
          `Not assigning ${assignee} to ${workflowitemId}. Already assigned!`,
        ),
      ],
    };
  }

  // Check authorization
  if (assigningUser.id !== "root") {
    const isAuthorized = (workflowItemToBeAssigned.permissions["workflowitem.assign"] || []).some(
      identity => canAssumeIdentity(assigningUser, identity),
    );
    if (!isAuthorized) {
      return { newEvents: [], errors: [new NotAuthorized(ctx, assigningUser.id, assignEvent)] };
    }
  }

  // const notificationEvent = createNotification(ctx, publisher, assignEvent);

  return { newEvents: [assignEvent], errors: [] };
}

// TODO: Implement Notifications first

// function createNotification(
//   ctx: Ctx,
//   publisher: string,
//   event: WorkflowitemAssigned.Event,
// ): BusinessEvent {
//   const recipient = event.assignee;

//   return Notification.createEvent(
//     ctx.source,
//     publisher,
//     event.assignee,
//     event,
//     undefined,
//     undefined,
//     event.workflowitemId,
//   );
// }
