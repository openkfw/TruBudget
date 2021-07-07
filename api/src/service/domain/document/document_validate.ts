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
import * as NotificationCreated from "../workflow/notification_created";
import * as Project from "../workflow/project";
import * as Subproject from "../workflow/subproject";
import * as DocumentValidated from "./document_validated";
import * as Workflowitem from "../workflow/workflowitem";
import * as WorkflowitemEventSourcing from "../workflow/workflowitem_eventsourcing";
import { GenericDocument } from "./document";
import { getAllDocuments } from "./document_get";

interface Repository {
  getWorkflowitem(workflowitemId: Workflowitem.Id): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
  getDocumentsEvents(): Promise<Result.Type<BusinessEvent[]>>;
  getOffchainDocumentsEvents(): Promise<Result.Type<BusinessEvent[]>>;
}

export async function documentValidate(
  isDocumentValid: boolean,
  documentId: string,
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

  // Check if document exists
  const allDocumentIds = await getAllDocuments(ctx, repository);
  if (Result.isErr(allDocumentIds)) {
    return new VError(allDocumentIds, "failed to fetch all documents");
  }
  const hasDocument = allDocumentIds.find(doc => doc.id === documentId);
  if (!hasDocument) {
    return new NotFound(ctx, "document", documentId);
  }

  // Create the new event:
  const documentValidatedEvent = DocumentValidated.createEvent(
    isDocumentValid,
    documentId,
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId,
  );
  if (Result.isErr(documentValidatedEvent)) {
    return new VError(documentValidatedEvent, "failed to create event in domain");
  }

  // Root user cannot validate a document
  if (issuer.id === "root") {
    return new PreconditionError(ctx, documentValidatedEvent, "'root' user cannot validate a document");
  }

  // Check that the new event is indeed valid:
  const result = WorkflowitemEventSourcing.newWorkflowitemFromEvent(
    ctx,
    workflowitem,
    documentValidatedEvent,
  );
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, documentValidatedEvent, [result]);
  }

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
