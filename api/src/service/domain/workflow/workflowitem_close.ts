import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import { Id } from "./workflowitem";
import * as WorkflowitemClosed from "./workflowitem_closed";
import * as Project from "./project";
import * as Subproject from "./subproject";
import { sourceWorkflowitems } from "./workflowitem_eventsourcing";
import { sortWorkflowitems } from "./workflowitem_ordering";

export function closeWorkflowitem(
  ctx: Ctx,
  closingUser: ServiceUser,
  allSubprojectWorkflowitemEvents: BusinessEvent[],
  workflowitemOrdering: Id[],
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Id,
): { newEvents: BusinessEvent[]; errors: Error[] } {
  const { workflowitems: items, errors: sourcingErrors } = sourceWorkflowitems(
    ctx,
    allSubprojectWorkflowitemEvents,
  );
  const sortedWorkflowitems = sortWorkflowitems(items, workflowitemOrdering);
  const workflowitemToClose = sortedWorkflowitems.find(item => item.id === workflowitemId);
  if (workflowitemToClose === undefined) {
    return { newEvents: [], errors: sourcingErrors };
  }

  // Don't do anything in case the workflowitem is already closed:
  if (workflowitemToClose.status === "closed") {
    return { newEvents: [], errors: [] };
  }

  const publisher = closingUser.id;
  const closeEvent = WorkflowitemClosed.createEvent(
    ctx.source,
    publisher,
    projectId,
    subprojectId,
    workflowitemId,
  );

  // Check authorization (if not root):
  if (closingUser.id !== "root") {
    const isAuthorized = (workflowitemToClose.permissions["workflowitem.close"] || []).some(
      identity => canAssumeIdentity(closingUser, identity),
    );
    if (!isAuthorized) {
      return { newEvents: [], errors: [new NotAuthorized(ctx, closingUser.id, closeEvent)] };
    }
  }

  // Make sure all previous items (wrt. the ordering) are already closed:
  for (const item of sortedWorkflowitems) {
    if (item.id === workflowitemId) {
      break;
    }
    if (item.status !== "closed") {
      return {
        newEvents: [],
        errors: [
          new PreconditionError(ctx, closeEvent, "all previous workflowitems must be closed"),
        ],
      };
    }
  }

  const newEvents: BusinessEvent[] = [closeEvent];

  // TODO: Implement Notifications first

  // if (workflowitemToClose.assignee !== undefined) {
  //   const recipient = workflowitemToClose.assignee;
  //   // TODO is this required?
  //   const projectId = undefined;
  //   // TODO is this required?
  //   const subprojectId = undefined;

  //   const notificationEvent = Notification.createEvent(
  //     ctx.source,
  //     publisher,
  //     recipient,
  //     closeEvent,
  //     projectId,
  //     subprojectId,
  //     workflowitemId,
  //   );
  //   newEvents.push(notificationEvent);
  // }

  return { newEvents, errors: sourcingErrors };
}
