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
import * as DocumentValidated from "./document_validated";
import * as Workflowitem from "./workflowitem";

interface Repository {
  getWorkflowitem(workflowitemId: Workflowitem.Id): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
}

export async function documentValidate(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; workflowitem: Workflowitem.Workflowitem }>> {
  const workflowitem = await repository.getWorkflowitem(workflowitemId);
  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  // Create the new event:
  const documentValidatedEvent = DocumentValidated.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId
  );
  if (Result.isErr(documentValidatedEvent)) {
    return new VError(documentValidatedEvent, "failed to create event");
  }

  // Check authorization (if not root):
  if (issuer.id !== "root" ) {
    return new PreconditionError(
      ctx,
      documentValidatedEvent,
      "Only the assignee is allowed to validate the document.",
    );
  }

  // Check that the new event is indeed valid:

  // Create notification events:
  let notifications: Result.Type<NotificationCreated.Event[]> = [];
  if (workflowitem.assignee !== undefined) {
    const recipientsResult = await repository.getUsersForIdentity(workflowitem.assignee);
    if (Result.isErr(recipientsResult)) {
      return new VError(recipientsResult, `fetch users for ${workflowitem.assignee} failed`);
    }
    notifications = recipientsResult.reduce((notifications, recipient) => {
      // The issuer doesn't receive a notification:
      if (recipient !== issuer.id) {
        const notification = NotificationCreated.createEvent(
          ctx.source,
          issuer.id,
          recipient,
          documentValidatedEvent,
          projectId,
        );
        if (Result.isErr(notification)) {
          return new VError(notification, "failed to create notification event");
        }
        notifications.push(notification);
      }
      return notifications;
    }, [] as NotificationCreated.Event[]);
  }
  if (Result.isErr(notifications)) {
    return new VError(notifications, "failed to create notification events");
  }
  return { newEvents: [documentValidatedEvent, ...notifications], workflowitem };
}
