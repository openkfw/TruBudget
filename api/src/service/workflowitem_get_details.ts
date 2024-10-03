import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { StorageServiceClientI } from "./Client_storage_service.h";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemGet from "./domain/workflow/workflowitem_get";
import * as WorkflowitemGetDetails from "./domain/workflow/workflowitem_get_details";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";
import * as WorkflowitemDocumentDownloadService from "./workflowitem_document_download";

export async function getWorkflowitemDetails(
  conn: ConnToken,
  storageServiceClient: StorageServiceClientI,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
): Promise<Result.Type<Workflowitem.Workflowitem>> {
  logger.debug({ projectId, subprojectId, workflowitemId }, "Getting workflowitem details");

  const workflowitemResult = await WorkflowitemGetDetails.getWorkflowitemDetails(
    ctx,
    serviceUser,
    workflowitemId,
    {
      getWorkflowitem: async () => {
        return await WorkflowitemGet.getWorkflowitem(ctx, serviceUser, workflowitemId, {
          getWorkflowitem: async () => {
            return await WorkflowitemCacheHelper.getWorkflowitem(
              conn,
              ctx,
              projectId,
              workflowitemId,
            );
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
    },
  );
  return Result.mapErr(
    workflowitemResult,
    (err) => new VError(err, `could not fetch workflowitem ${workflowitemId}`),
  );
}
