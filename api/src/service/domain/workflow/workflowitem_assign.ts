import { VError } from "verror";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as NotificationCreated from "./notification_created";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemAssigned from "./workflowitem_assigned";
import * as WorkflowitemEventSourcing from "./workflowitem_eventsourcing";
import logger from "lib/logger";

interface Repository {
  getWorkflowitem(workflowitemId: string): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
  applyWorkflowitemType(
    event: BusinessEvent,
    workflowitem: Workflowitem.Workflowitem,
  ): Result.Type<BusinessEvent[]>;
}

export async function assignWorkflowitem(
  ctx: Ctx,
  publisher: ServiceUser,
  assignee: UserRecord.Id,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; workflowitem: Workflowitem.Workflowitem }>> {
  const workflowitem = await repository.getWorkflowitem(workflowitemId);
  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  if (assignee === workflowitem.assignee) {
    // This is already assigned to that user.
    return { newEvents: [], workflowitem };
  }

  logger.trace(
    { publisher, assignee, projectId, subprojectId, workflowitemId },
    "Creating workflowitem_assigned event",
  );
  const assignEvent = WorkflowitemAssigned.createEvent(
    ctx.source,
    publisher.id,
    projectId,
    subprojectId,
    workflowitemId,
    assignee,
  );

  if (Result.isErr(assignEvent)) {
    return new VError(assignEvent, "failed to create event");
  }

  logger.trace({ publisher }, "Checking user authorization");
  if (publisher.id !== "root") {
    const assignIntent = "workflowitem.assign";
    if (!Workflowitem.permits(workflowitem, publisher, [assignIntent])) {
      return new NotAuthorized({
        ctx,
        userId: publisher.id,
        intent: assignIntent,
        target: workflowitem,
      });
    }
  }

  logger.trace({ event: assignEvent }, "Checking event validity");
  const result = WorkflowitemEventSourcing.newWorkflowitemFromEvent(ctx, workflowitem, assignEvent);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, assignEvent, [result]);
  }

  logger.trace("Creating notification events");
  const recipientsResult = await repository.getUsersForIdentity(assignee);
  if (Result.isErr(recipientsResult)) {
    return new VError(recipientsResult, `fetch users for ${assignee} failed`);
  }
  const notifications = recipientsResult.reduce((notifications, recipient) => {
    // The issuer doesn't receive a notification:
    if (recipient !== publisher.id) {
      const notification = NotificationCreated.createEvent(
        ctx.source,
        publisher.id,
        recipient,
        assignEvent,
        projectId,
      );
      if (Result.isErr(notification)) {
        return new VError(notification, "failed to create notification event");
      }
      notifications.push(notification);
    }
    return notifications;
  }, [] as NotificationCreated.Event[]);
  if (Result.isErr(notifications)) {
    return new VError(notifications, "failed to create notification events");
  }
  const workflowitemTypeEvents = repository.applyWorkflowitemType(assignEvent, workflowitem);

  if (Result.isErr(workflowitemTypeEvents)) {
    return new VError(workflowitemTypeEvents, "failed to apply workflowitem type");
  }
  return { newEvents: [assignEvent, ...notifications, ...workflowitemTypeEvents], workflowitem };
}
