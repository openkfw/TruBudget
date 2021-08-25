import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemGetDetails from "./domain/workflow/workflowitem_get_details";
import * as WorkflowitemGet from "./domain/workflow/workflowitem_get";
import * as WorkflowitemDocumentDownloadService from "./workflowitem_document_download";
import { StorageServiceClientI } from "./Client_storage_service.h";

export async function getWorkflowitemDetails(
  conn: ConnToken,
  storageServiceClient: StorageServiceClientI,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
): Promise<Result.Type<Workflowitem.Workflowitem>> {
  const workflowitemResult = await Cache.withCache(conn, ctx, async (cache) =>
    WorkflowitemGetDetails.getWorkflowitemDetails(ctx, serviceUser, workflowitemId, {
      getWorkflowitem: async () => {
        return WorkflowitemGet.getWorkflowitem(ctx, serviceUser, workflowitemId, {
          getWorkflowitem: async () => {
            return cache.getWorkflowitem(projectId, subprojectId, workflowitemId);
          },
        });
      },
      downloadDocument: async (docId) => {
        return WorkflowitemDocumentDownloadService.getDocument(
          conn,
          storageServiceClient,
          ctx,
          serviceUser,
          projectId,
          subprojectId,
          workflowitemId,
          docId,
        );
      },
    }),
  );
  return Result.mapErr(
    workflowitemResult,
    (err) => new VError(err, `could not fetch workflowitem ${workflowitemId}`),
  );
}
