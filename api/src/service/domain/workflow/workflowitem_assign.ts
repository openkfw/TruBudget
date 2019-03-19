import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
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

interface Repository {
  getWorkflowitem(workflowitemId: string): Promise<Result.Type<Workflowitem.Workflowitem>>;
}

export async function assignWorkflowitem(
  ctx: Ctx,
  assigningUser: ServiceUser,
  assignee: UserRecord.Id,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; workflowitem: Workflowitem.Workflowitem }>> {
  const workflowItemToBeAssigned = await repository.getWorkflowitem(workflowitemId);

  // Check if Workflowitem exists
  if (Result.isErr(workflowItemToBeAssigned)) {
    return new VError(
      new NotFound(ctx, "workflowitem", workflowitemId),
      `Couldn't assign ${assignee} to workflowitem ${workflowitemId}. Workflowitem not found!`,
    );
  }

  const publisher = assigningUser.id;

  // Create the new event:
  const assignEvent = WorkflowitemAssigned.createEvent(
    ctx.source,
    publisher,
    projectId,
    subprojectId,
    workflowitemId,
    assignee,
  );

  if (Result.isErr(workflowItemToBeAssigned)) {
    return new VError(
      new NotFound(ctx, "workflowitem", workflowitemId),
      `Couldn't assign ${assignee} to workflowitem ${workflowitemId}. Workflowitem not found!`,
    );
  }

  // Dont re-assign to the same user
  if (assignee === workflowItemToBeAssigned.assignee) {
    return { newEvents: [], workflowitem: workflowItemToBeAssigned };
  }

  // Check authorization
  if (publisher !== "root") {
    if (!Workflowitem.permits(workflowItemToBeAssigned, assigningUser, ["workflowitem.assign"])) {
      return new NotAuthorized(ctx, publisher, assignEvent);
    }
  }

  // const notificationEvent = createNotification(ctx, publisher, assignEvent);

  return { newEvents: [assignEvent], workflowitem: workflowItemToBeAssigned };
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
