import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "../workflow/workflowitem";
import * as DocumentShared from "./document_shared";
import { config } from "../../../config";
import * as DocumentUploaded from "../document/document_uploaded";

import VError = require("verror");
import { UploadedDocument } from "./document";

type Base64String = string;
interface DocumentStorageServiceResponse {
  id: string;
  fileName: string;
  base64: Base64String;
}

interface Repository {
  getWorkflowitem(workflowitemId): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getOffchainDocument(docId: string): Promise<Result.Type<UploadedDocument | undefined>>;
  getWorkflowitem(workflowitemId): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getDocumentInfo(docId: string): Promise<Result.Type<DocumentUploaded.Document | undefined>>;
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

async function getDocumentFromStorage(
  ctx,
  repository,
  documentId,
  workflowitem,
): Promise<Result.Type<DocumentStorageServiceResponse>> {
  // Get all events from one document
  const documentInfo = await repository.getDocumentInfo(documentId);

  if (!documentInfo || Result.isErr(documentInfo)) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `couldn't get document information from ${workflowitem}`,
    );
  }

  //get secret from stream
  const encryptedSecret = await repository.getSecret(documentId, config.organization);
  if (!encryptedSecret || Result.isErr(encryptedSecret)) {
    return new VError(
      new NotFound(ctx, "secret", documentId),
      `couldn't get secret for document ${documentId} and organization ${config.organization}. Document is not shared with this organizaiton`,
    );
  }

  // decrypt secret with own private key
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

export async function getDocument(
  ctx: Ctx,
  user: ServiceUser,
  workflowitemId: string,
  documentId: string,
  repository: Repository,
): Promise<Result.Type<any>> {
  // check for permissions etc
  const workflowitem = await repository.getWorkflowitem(workflowitemId);
  if (Result.isErr(workflowitem)) {
    return workflowitem;
  }

  const intent = "workflowitem.view";
  if (!Workflowitem.permits(workflowitem, user, [intent])) {
    return new NotAuthorized({ ctx, userId: user.id, intent, target: workflowitem });
  }

  // Only return if document has relation to the workflowitem
  if (!workflowitem.documents.some((d) => d.documentId === documentId)) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `workfowitem ${workflowitem} has no link to document`,
    );
  }
  // Try to get event from offchain storage
  const offchainDocument = await repository.getOffchainDocument(documentId);
  if (Result.isErr(offchainDocument)) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `couldn't get document events from ${workflowitem}`,
    );
  }

  if (!offchainDocument) {
    // Try to get document from storage service
    const documentFromStorage = await getDocumentFromStorage(
      ctx,
      repository,
      documentId,
      workflowitem,
    );

    if (Result.isErr(documentFromStorage)) {
      return new VError(
        new NotFound(ctx, "document", documentId),
        `Error while getting document from storage for workflowitem ${workflowitem.id}`,
      );
    } else if (!documentFromStorage) {
      return new VError(
        new NotFound(ctx, "document", documentId),
        `Couldn't find document from storage for workflowitem ${workflowitem.id}`,
      );
    } else {
      return documentFromStorage;
    }
  } else {
    return offchainDocument;
    // .filter((d) => d.workflowitemId === workflowitem.id)
    // .map((d) => d.document)[0];
  }
}
