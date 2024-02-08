import logger from "lib/logger";
import StorageServiceClient from "./Client_storage_service";
import VError = require("verror");
import { config } from "../config";
import { ConnToken } from "./conn";
import { Ctx } from "../lib/ctx";
import { decryptWithKey } from "../lib/asymmetricCrypto";
import { ServiceUser } from "./domain/organization/service_user";
import { StorageServiceClientI } from "./Client_storage_service.h";
import { store } from "./store";
import * as Cache from "./cache2";
import * as DocumentGet from "./domain/document/document_get";
import * as PrivateKeyGet from "../organization/organization";
import * as Project from "./domain/workflow/project";
import * as ProjectCacheHelper from "./project_cache_helper";
import * as Result from "../result";
import * as SecretGet from "./domain/document/secret_get";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";
import * as WorkflowitemDocumentDelete from "./domain/document/workflowitem_document_delete";
import * as WorkflowitemSnapshotPublish from "./domain/workflow/workflowitem_snapshot_publish";
import * as TypeEvents from "./domain/workflowitem_types/apply_workflowitem_type";
import { BusinessEvent } from "./domain/business_event";

export interface Service {
  deleteDocument(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
    documentId: string,
  ): Promise<Result.Type<void>>;
}

export async function deleteDocument(
  conn: ConnToken,
  storageServiceClient: StorageServiceClientI,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  documentId: string,
): Promise<Result.Type<void>> {
  logger.debug({ projectId, subprojectId, workflowitemId, documentId }, "Deleting document");

  const documentResult = await Cache.withCache(conn, ctx, async (cache) =>
    WorkflowitemDocumentDelete.deleteDocument(
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      workflowitemId,
      documentId,
      {
        getWorkflowitem: async () => {
          return await WorkflowitemCacheHelper.getWorkflowitem(
            conn,
            ctx,
            projectId,
            workflowitemId,
          );
        },
        getDocumentInfo: async (docId) => {
          return DocumentGet.getDocumentInfo(ctx, docId, {
            getDocumentsEvents: async () => {
              return cache.getDocumentUploadedEvents();
            },
            getAllProjects: async () => {
              return await ProjectCacheHelper.getAllProjects(conn, ctx);
            },
            getAllSubprojects: async (projectId) => {
              return await SubprojectCacheHelper.getAllSubprojects(conn, ctx, projectId);
            },
            getAllWorkflowitems: async (projectId, subprojectId) => {
              return await WorkflowitemCacheHelper.getAllWorkflowitems(
                conn,
                ctx,
                projectId,
                subprojectId,
              );
            },
          });
        },
        getSecret: async (docId, organization) => {
          return SecretGet.getSecret(ctx, docId, organization, {
            getSecretPublishedEvents: async () => {
              return cache.getSecretPublishedEvents();
            },
          });
        },
        getPrivateKey: async (organization) => {
          return PrivateKeyGet.getPrivateKey(
            conn.multichainClient,
            organization,
            config.organizationVaultSecret,
          );
        },
        decryptWithKey: async (secret, privateKey) => {
          return decryptWithKey(secret, privateKey);
        },
        deleteDocumentFromStorage: async (id, secret) => {
          return storageServiceClient.deleteObject(id, secret);
        },
        deleteDocumentFromExternalStorage: async (id, secret, storageServiceUrl) => {
          const externalStorageServiceClient = new StorageServiceClient({
            baseURL: storageServiceUrl,
            timeout: 10000,
          });
          return externalStorageServiceClient.deleteObject(id, secret);
        },
        applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
          return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
        },
      },
    ),
  );

  if (Result.isErr(documentResult)) {
    return new VError(documentResult, "delete document failed");
  }
  const { newEvents } = documentResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }

  const { canPublish, eventData } = await WorkflowitemSnapshotPublish.publishWorkflowitemSnapshot(
    ctx,
    conn,
    projectId,
    workflowitemId,
    serviceUser,
  );
  if (canPublish) {
    if (Result.isErr(eventData)) {
      return new VError(eventData, "update workflowitem snapshot failed");
    }
    const publishEvent = eventData;
    await store(conn, ctx, publishEvent, serviceUser.address);
  }

  Result.mapErr(
    documentResult,
    (err) =>
      new VError(err, `could not delete document ${documentId} of workflowitem ${workflowitemId}`),
  );
}
