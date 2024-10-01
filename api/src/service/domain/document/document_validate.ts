import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
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
import * as Workflowitem from "../workflow/workflowitem";
import * as WorkflowitemEventSourcing from "../workflow/workflowitem_eventsourcing";

import { getAllDocumentReferences } from "./document_get";
import * as DocumentValidated from "./document_validated";

interface Repository {
  getWorkflowitem(workflowitemId: Workflowitem.Id): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
  getDocumentsEvents(): Promise<Result.Type<BusinessEvent[]>>;
  getAllProjects(): Promise<Project.Project[]>;
  getAllSubprojects(projectId: Project.Id): Promise<Result.Type<Subproject.Subproject[]>>;
  getAllWorkflowitems(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Result.Type<Workflowitem.Workflowitem[]>>;
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
  logger.trace({ documentId }, "Validating document with id");
  const workflowitem = await repository.getWorkflowitem(workflowitemId);
  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  logger.trace("Checking if document exists");
  const allDocumentReferences = await getAllDocumentReferences(repository);
  if (Result.isErr(allDocumentReferences)) {
    return new VError(allDocumentReferences, "failed to fetch all documents");
  }

  const hasDocument = allDocumentReferences.find((doc) => doc.id === documentId);
  if (!hasDocument) {
    return new NotFound(ctx, "document", documentId);
  }

  const documentValidatedEvent = DocumentValidated.createEvent(
    isDocumentValid,
    documentId,
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(documentValidatedEvent)) {
    return new VError(documentValidatedEvent, "failed to create event in domain");
  }

  if (issuer.id === "root") {
    return new PreconditionError(
      ctx,
      documentValidatedEvent,
      "'root' user cannot validate a document",
    );
  }

  logger.trace("Checking if document is valid");
  const result = WorkflowitemEventSourcing.newWorkflowitemFromEvent(
    ctx,
    workflowitem,
    documentValidatedEvent,
  );
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, documentValidatedEvent, [result]);
  }

  let notifications: Result.Type<NotificationCreated.Event[]> = [];
  if (!workflowitem.assignee) {
    return { newEvents: [documentValidatedEvent], workflowitem };
  }

  logger.trace({ assignee: workflowitem.assignee }, "Creating notification events for assignee");
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
        undefined,
        undefined,
        new Date().toISOString(),
        issuer.metadata,
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

  return { newEvents: [documentValidatedEvent, ...notifications], workflowitem };
}
