import logger from "lib/logger";
import { VError } from "verror";
import { encryptWithKey } from "../lib/asymmetricCrypto";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { StorageServiceClientI } from "./Client_storage_service.h";
import { ConnToken } from "./conn";
import { StoredDocument } from "./domain/document/document";
import { sourceDocuments } from "./domain/document/document_eventsourcing";
import * as DocumentGet from "./domain/document/document_get";
import * as DocumentUpload from "./domain/document/document_upload";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserQuery from "./domain/organization/user_query";
import * as PublicKeyGet from "./public_key_get";
import { store } from "./store";
import * as ProjectCacheHelper from "./project_cache_helper";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";

export async function documentUpload(
  conn: ConnToken,
  storageServiceClient: StorageServiceClientI,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: DocumentUpload.RequestData,
): Promise<Result.Type<StoredDocument>> {
  logger.debug({ req: requestData }, "Uploading document");
  const uploadedDocumentResult = await Cache.withCache(conn, ctx, async (cache) => {
    return DocumentUpload.uploadDocument(ctx, serviceUser, requestData, {
      getAllDocumentReferences: async () => {
        return DocumentGet.getAllDocumentReferences({
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
      getPublicKey: async (organization) => {
        return PublicKeyGet.getPublicKey(conn, ctx, organization);
      },
      storeDocument: async (id, name, hash) => {
        return storageServiceClient.uploadObject(id, name, hash);
      },
      encryptWithKey: async (secret, publicKey) => {
        return encryptWithKey(secret, publicKey);
      },
      getUser: (userId) => UserQuery.getUser(conn, ctx, serviceUser, userId),
    });
  });

  if (Result.isErr(uploadedDocumentResult))
    return new VError(uploadedDocumentResult, "upload document failed");
  const newEvents = uploadedDocumentResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }

  const { documents } = sourceDocuments(ctx, newEvents);
  const newDocument = documents.find((doc) => doc.fileName === requestData.fileName);

  if (!newDocument) {
    return new Error("A document with this name was not uploaded");
  }

  const documentUploaded: StoredDocument = {
    id: newDocument.id,
    fileName: newDocument.fileName,
    organization: newDocument.organization,
    organizationUrl: newDocument.organizationUrl,
  };

  return documentUploaded;
}
