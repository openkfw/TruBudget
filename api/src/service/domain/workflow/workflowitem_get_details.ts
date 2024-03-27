import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import * as Result from "../../../result";
import * as WorkflowitemDocument from "../document/document";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "./workflowitem";

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

  logger.trace({ user }, "Checking user authorization");
  if (user.id !== "root") {
    const intent = "workflowitem.list";
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
  documents: WorkflowitemDocument.DocumentOrExternalLinkReference[],
  repository: Repository,
): Promise<WorkflowitemDocument.DocumentOrExternalLinkReference[]> {
  const docsWithAvailability: WorkflowitemDocument.DocumentOrExternalLinkReference[] = [];

  for (const doc of documents) {
    const result = await repository.downloadDocument(doc.id);
    docsWithAvailability.push({ ...doc, available: Result.isOk(result) });
  }

  return docsWithAvailability;
}
