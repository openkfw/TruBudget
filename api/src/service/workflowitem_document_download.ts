import logger from "lib/logger";
import VError = require("verror");

import { config } from "../config";
import { decryptWithKey } from "../lib/asymmetricCrypto";
import { Ctx } from "../lib/ctx";
import * as PrivateKeyGet from "../organization/organization";
import * as Result from "../result";
import * as Cache from "./cache2";
import StorageServiceClient from "./Client_storage_service";
import { StorageServiceClientI } from "./Client_storage_service.h";
import { ConnToken } from "./conn";
import * as WorkflowitemDocument from "./domain/document/document";
import * as DocumentGet from "./domain/document/document_get";
import * as SecretGet from "./domain/document/secret_get";
import * as WorkflowitemDocumentDownload from "./domain/document/workflowitem_document_download";
import * as WorkflowitemDocumentUploaded from "./domain/document/workflowitem_document_uploaded";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as Liststreamkeyitems from "./liststreamkeyitems";

export async function getDocument(
  conn: ConnToken,
  storageServiceClient: StorageServiceClientI,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  documentId: string,
): Promise<Result.Type<WorkflowitemDocument.UploadedDocument>> {
  logger.debug({ projectId, subprojectId, workflowitemId, documentId }, "Getting document");

  const documentResult = await Cache.withCache(conn, ctx, async (cache) =>
    WorkflowitemDocumentDownload.getDocument(ctx, serviceUser, workflowitemId, documentId, {
      getWorkflowitem: async () => {
        return cache.getWorkflowitem(projectId, subprojectId, workflowitemId);
      },
      getOffchainDocumentEvent: async (docId) => {
        const items: Liststreamkeyitems.Item[] = await conn.multichainClient.v2_readStreamItems(
          "offchain_documents",
          docId,
          1,
        );

        const documentEvents: WorkflowitemDocumentUploaded.Event[] = items
          .filter((i) => i.data.json.type === "workflowitem_document_uploaded")
          .map((i) => i.data.json);
        if (documentEvents.length > 1) {
          logger.warn("Duplicate document with this id");
          return new VError(
            `could not get document ${documentId} of workflowitem ${workflowitemId}. Duplicate document with this id`,
          );
        }
        return documentEvents[0];
      },
      getDocumentInfo: async (docId) => {
        return DocumentGet.getDocumentInfo(ctx, docId, {
          getDocumentsEvents: async () => {
            return cache.getDocumentUploadedEvents();
          },
          getAllProjects: async () => {
            return cache.getProjects();
          },
          getAllSubprojects: async (projectId) => {
            return cache.getSubprojects(projectId);
          },
          getAllWorkflowitems: async (projectId, subprojectId) => {
            return cache.getWorkflowitems(projectId, subprojectId);
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
      getDocumentFromStorage: async (id, secret) => {
        return storageServiceClient.downloadObject(id, secret);
      },
      getDocumentFromExternalStorage: async (id, secret, storageServiceUrl) => {
        const externalStorageServiceClient = new StorageServiceClient({
          baseURL: storageServiceUrl,
          timeout: 10000,
        });
        return externalStorageServiceClient.downloadObject(id, secret);
      },
    }),
  );

  logger.info(`Document download response: ${documentResult}`);
  return Result.mapErr(
    documentResult,
    (err) =>
      new VError(err, `could not get document ${documentId} of workflowitem ${workflowitemId}`),
  );
}
