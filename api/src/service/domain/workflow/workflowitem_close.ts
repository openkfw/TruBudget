import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as NotificationCreated from "./notification_created";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import { Id } from "./workflowitem";
import * as WorkflowitemClosed from "./workflowitem_closed";
import * as WorkflowitemEventSourcing from "./workflowitem_eventsourcing";
import { sortWorkflowitems } from "./workflowitem_ordering";

interface Repository {
  getWorkflowitems(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem[]>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
  getSubproject(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
  applyWorkflowitemType(
    event: BusinessEvent,
    workflowitem: Workflowitem.Workflowitem,
  ): Result.Type<BusinessEvent[]>;
}

export async function closeWorkflowitem(
  ctx: Ctx,
  closingUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Id,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const workflowitemsResult = await repository.getWorkflowitems(projectId, subprojectId);
  if (Result.isErr(workflowitemsResult)) {
    return new VError(workflowitemsResult, "failed to get workflowitems");
  }
  const workflowitems = workflowitemsResult;

  const subproject = await repository.getSubproject(projectId, subprojectId);
  if (Result.isErr(subproject)) {
    return new VError(`Couldn't get workflowitem ordering for ${subprojectId}`, subproject);
  }

  const { workflowitemOrdering } = subproject;

  const sortedWorkflowitems = sortWorkflowitems(workflowitems, workflowitemOrdering);
  const workflowitemToClose = sortedWorkflowitems.find((item) => item.id === workflowitemId);

  if (workflowitemToClose === undefined) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  // Don't do anything in case the workflowitem is already closed:
  if (workflowitemToClose.status === "closed") {
    return [];
  }

  const publisher = closingUser.id;
  const closeEvent = WorkflowitemClosed.createEvent(
    ctx.source,
    publisher,
    projectId,
    subprojectId,
    workflowitemId,
  );
  if (Result.isErr(closeEvent)) {
    return new VError(closeEvent, "failed to create event");
  }

  const assignedIdentitiesResult = await repository.getUsersForIdentity(
    workflowitemToClose.assignee,
  );
  if (Result.isErr(assignedIdentitiesResult)) {
    return new VError(
      assignedIdentitiesResult,
      `fetch users for ${workflowitemToClose.assignee} failed`,
    );
  }
  const assignedIdentities = assignedIdentitiesResult;

  // Check if user is allowed to close the workflowitem
  if (closingUser.id !== "root") {
    if (subproject.validator !== undefined && subproject.validator !== closingUser.id) {
      return new PreconditionError(
        ctx,
        closeEvent,
        "Only the validator of this subproject is allowed to close workflowitems",
      );
    } else if (!assignedIdentities.includes(closingUser.id)) {
      return new PreconditionError(
        ctx,
        closeEvent,
        "Only the assignee is allowed to close the workflowitem.",
      );
    }
  }

  // Make sure all previous items (wrt. the ordering) are already closed:
  for (const item of sortedWorkflowitems) {
    if (item.id === workflowitemId) {
      break;
    }
    if (item.status !== "closed") {
      return new PreconditionError(ctx, closeEvent, "all previous workflowitems must be closed");
    }
  }

  // Check that the new event is indeed valid:
  const result = WorkflowitemEventSourcing.newWorkflowitemFromEvent(
    ctx,
    workflowitemToClose,
    closeEvent,
  );
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, closeEvent, [result]);
  }

  // Create notification events:
  const notifications: Result.Type<NotificationCreated.Event[]> = assignedIdentities.reduce(
    (notifications, recipient) => {
      // The issuer doesn't receive a notification:
      if (recipient !== closingUser.id) {
        const notification = NotificationCreated.createEvent(
          ctx.source,
          closingUser.id,
          recipient,
          closeEvent,
          projectId,
        );
        if (Result.isErr(notification)) {
          return new VError(notification, "failed to create notification event");
        }
        notifications.push(notification);
      }
      return notifications;
    },
    [] as NotificationCreated.Event[],
  );
  if (Result.isErr(notifications)) {
    return new VError(notifications, "failed to create notification events");
  }

  const workflowitemTypeEvents = repository.applyWorkflowitemType(closeEvent, workflowitemToClose);

  if (Result.isErr(workflowitemTypeEvents)) {
    return new VError(workflowitemTypeEvents, "failed to apply workflowitem type");
  }

  return [closeEvent, ...notifications, ...workflowitemTypeEvents];
}
