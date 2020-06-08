import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as WorkflowitemDocument from "./document";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemDocumentUploaded from "./workflowitem_document_uploaded";
import VError = require("verror");

interface Repository {
  getWorkflowitem(workflowitemId): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getDocumentEvents(documentId): Promise<Result.Type<WorkflowitemDocumentUploaded.Event[]>>;
}

export async function getDocument(
  ctx: Ctx,
  user: ServiceUser,
  workflowitemId: string,
  documentId: string,
  repository: Repository,
): Promise<Result.Type<WorkflowitemDocument.UploadedDocument>> {
  // check for permissions etc
  const workflowitem = await repository.getWorkflowitem(workflowitemId);
  if (Result.isErr(workflowitem)) {
    return workflowitem;
  }

  const intent = "workflowitem.view";
  if (!Workflowitem.permits(workflowitem, user, [intent])) {
    return new NotAuthorized({ ctx, userId: user.id, intent, target: workflowitem });
  }

  // Get all events from one document
  const documentEvents = await repository.getDocumentEvents(documentId);
  if (Result.isErr(documentEvents)) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `couldn't get document events from ${workflowitem}`,
    );
  }

  // Only return if document has relation to the workflowitem
  if (!workflowitem.documents.some((d) => d.documentId === documentId)) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `workfowitem ${workflowitem} has no link to document`,
    );
  }

  return documentEvents
    .filter((d) => d.workflowitemId === workflowitem.id)
    .map((d) => d.document)[0];
}
