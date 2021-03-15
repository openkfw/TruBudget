import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as WorkflowitemDocument from "./domain/workflow/document";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemDocumentDownload from "./domain/workflow/workflowitem_document_download";
import * as WorkflowitemDocumentUploaded from "./domain/workflow/workflowitem_document_uploaded";
import * as Liststreamkeyitems from "./liststreamkeyitems";
import VError = require("verror");

export async function getDocument(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  documentId: string,
): Promise<Result.Type<WorkflowitemDocument.UploadedDocument>> {
  const documentResult = await Cache.withCache(conn, ctx, async (cache) =>
    WorkflowitemDocumentDownload.getDocument(ctx, serviceUser, workflowitemId, documentId, {
      getWorkflowitem: async () => {
        return cache.getWorkflowitem(projectId, subprojectId, workflowitemId);
      },
      getDocumentEvents: async (documentId) => {
        const items: Liststreamkeyitems.Item[] = await conn.multichainClient.v2_readStreamItems(
          "offchain_documents",
          documentId,
          1,
        );

        const documentEvents: WorkflowitemDocumentUploaded.Event[] = items.map((i) => i.data.json);
        return documentEvents;
      },
    }),
  );

  return Result.mapErr(
    documentResult,
    (err) =>
      new VError(err, `could not get document ${documentId} of workflowitem ${workflowitemId}`),
  );
}
