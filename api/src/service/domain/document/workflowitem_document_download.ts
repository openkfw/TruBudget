import VError = require("verror");

import { config } from "../../../config";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "../workflow/workflowitem";

import { StoredDocument } from "./document";
import * as DocumentShared from "./document_shared";

type Base64String = string;

interface DocumentStorageServiceResponse {
  id: string;
  fileName: string;
  base64: Base64String;
}

interface Repository {
  getWorkflowitem(workflowitemId): Promise<Result.Type<Workflowitem.Workflowitem>>;

  getDocumentInfo(docId: string): Promise<Result.Type<StoredDocument | undefined>>;

  getSecret(docId, organization): Promise<Result.Type<DocumentShared.SecretPublished>>;

  decryptWithKey(secret, privateKey): Promise<Result.Type<string>>;

  getPrivateKey(organization): Promise<Result.Type<string>>;

  getDocumentFromStorage(id, secret): Promise<Result.Type<DocumentStorageServiceResponse>>;

  getDocumentFromExternalStorage(
    id,
    secret,
    storageServiceUrl,
  ): Promise<Result.Type<DocumentStorageServiceResponse>>;
}

async function getDocumentFromInternalOrExternalStorage(
  ctx,
  repository,
  documentId,
  workflowitem,
): Promise<Result.Type<DocumentStorageServiceResponse>> {
  // Get all events from one document
  logger.trace("Fetching document: ", documentId, " from internal *or* external storage ...");

  const documentInfo = await repository.getDocumentInfo(documentId);

  if (!documentInfo || Result.isErr(documentInfo)) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `couldn't get document information from ${workflowitem.displayName}`,
    );
  }

  //get secret from stream
  logger.trace("Fetching secret from stream for document: ", documentId);
  const encryptedSecret = await repository.getSecret(documentId, config.organization);
  if (!encryptedSecret || Result.isErr(encryptedSecret)) {
    return new VError(
      new NotFound(ctx, "secret", documentId),
      `couldn't get secret for document ${documentId} and organization ${config.organization}. Document is not shared with this organization`,
    );
  }

  // decrypt secret with own private key
  logger.trace("Decrypting document secret: ", documentId);

  const privateKeyBase64Result = await repository.getPrivateKey(config.organization);
  if (Result.isErr(privateKeyBase64Result)) {
    return new VError(privateKeyBase64Result, "cannot get private key");
  }
  const privateBuff = Buffer.from(privateKeyBase64Result, "base64");
  const privateKey = privateBuff.toString("utf8");
  const decryptedSecret = await repository.decryptWithKey(
    encryptedSecret.encryptedSecret,
    privateKey,
  );

  if (Result.isErr(decryptedSecret)) {
    return new VError(decryptedSecret, "failed to decrypt secret");
  }

  // send the request to the local storage service
  let documentFromStorage: DocumentStorageServiceResponse;
  if (config.documentFeatureEnabled && documentInfo.organization === config.organization) {
    documentFromStorage = await repository.getDocumentFromStorage(documentId, decryptedSecret);
  } else {
    // send the request to the external storage service
    documentFromStorage = await repository.getDocumentFromExternalStorage(
      documentId,
      decryptedSecret,
      documentInfo.organizationUrl,
    );
  }

  if (Result.isErr(documentFromStorage)) {
    return new VError(documentFromStorage, "failed to get document from storage service");
  }

  documentFromStorage.fileName = documentInfo.fileName;

  return documentFromStorage;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getDocument(
  ctx: Ctx,
  user: ServiceUser,
  workflowitemId: string,
  documentId: string,
  repository: Repository,
): Promise<Result.Type<any>> {
  logger.trace("Fetching document: ", documentId, "...");

  // check for permissions etc
  const workflowitem = await repository.getWorkflowitem(workflowitemId);
  if (Result.isErr(workflowitem)) {
    return workflowitem;
  }

  const intent = "workflowitem.list";
  if (!Workflowitem.permits(workflowitem, user, [intent])) {
    return new NotAuthorized({ ctx, userId: user.id, intent, target: workflowitem });
  }

  // Only return if document has relation to the workflowitem
  if (!workflowitem.documents.some((d) => d.id === documentId)) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `workfowitem ${workflowitem.displayName} has no link to document`,
    );
  }
  logger.trace("Trying to find document: ", documentId, "via storage service ...");

  // Try to get document from storage service
  const documentFromStorage = await getDocumentFromInternalOrExternalStorage(
    ctx,
    repository,
    documentId,
    workflowitem,
  );

  if (Result.isErr(documentFromStorage)) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `Error while getting document from storage for workflowitem ${workflowitem.id} ERROR HERE: ${documentFromStorage}`,
    );
  } else if (!documentFromStorage) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `Couldn't find document from storage for workflowitem ${workflowitem.id}`,
    );
  } else {
    return documentFromStorage;
  }
}
