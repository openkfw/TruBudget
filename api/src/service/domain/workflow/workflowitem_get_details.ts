import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemDocument from "../document/document";

interface Repository {
  getWorkflowitem(): Promise<Result.Type<Workflowitem.Workflowitem>>;
  downloadDocument(docId: string): Promise<Result.Type<WorkflowitemDocument.UploadedDocument>>;
}

export async function getWorkflowitemDetails(
  ctx: Ctx,
  user: ServiceUser,
  workflowitemId: string,
  repository: Repository,
): Promise<Result.Type<Workflowitem.Workflowitem>> {
  const workflowitem = await repository.getWorkflowitem();

  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  if (user.id !== "root") {
    const intent = "workflowitem.view";
    if (!Workflowitem.permits(workflowitem, user, [intent])) {
      return new NotAuthorized({ ctx, userId: user.id, intent, target: workflowitem });
    }
  }

  const documentsWithAvailability = await setDocumentAvailability(
    workflowitem.documents,
    repository,
  );
  return { ...workflowitem, documents: documentsWithAvailability };
}

async function setDocumentAvailability(
  documents: WorkflowitemDocument.StoredDocument[],
  repository: Repository,
): Promise<WorkflowitemDocument.StoredDocument[]> {
  const docsWithAvailability: WorkflowitemDocument.StoredDocument[] = [];

  for (const doc of documents) {
    const result = await repository.downloadDocument(doc.id);
    docsWithAvailability.push({ ...doc, available: Result.isOk(result) });
  }

  return docsWithAvailability;
}
