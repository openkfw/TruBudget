import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { downloadAsPromised } from "../lib/minio";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as WorkflowitemDocument from "./domain/workflow/document";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemDocumentDownloadMinio from "./domain/workflow/workflowitem_document_download_minio";
import * as WorkflowitemDocumentUploaded from "./domain/workflow/workflowitem_document_uploaded";
import * as Liststreamkeyitems from "./liststreamkeyitems";
import VError = require("verror");

export async function getDocumentMinio(
  conn: ConnToken,
  ctx: Ctx,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  documentId: string,
  secret: string,
): Promise<Result.Type<WorkflowitemDocument.UploadedDocument>> {
  const documentResult = await Cache.withCache(conn, ctx, async (cache) =>
    WorkflowitemDocumentDownloadMinio.getDocumentMinio(ctx, workflowitemId, secret,  documentId, {
      getWorkflowitem: async () => {
        return cache.getWorkflowitem(projectId, subprojectId, workflowitemId);
      },
      getDocumentEncryptedSecret: async (documentId) => {
        // TODO get encrypted document secret
      },
      getDocumentEvents: async (documentId, secret) => {
        const items: Liststreamkeyitems.Item[] = await conn.multichainClient.v2_readStreamItems(
          "offchain_documents",
          documentId,
          1,
        );

        const documentEvents: WorkflowitemDocumentUploaded.Event[] = [];
        for (const item of items) {
          const event = item.data.json;
          if (event.document.base64 === "") {
            const { data: base64, meta } = await downloadAsPromised(event.document.id);
            if (meta.secret === secret) {
              event.document.base64 = base64;
            }

          }
          documentEvents.push(event);

        }
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
