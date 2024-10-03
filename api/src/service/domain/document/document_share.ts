import { VError } from "verror";

import { config } from "../../../config";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "../workflow/workflowitem";

import { StoredDocument } from "./document";
import * as DocumentShared from "./document_shared";

type Base64String = string;

export interface RequestData {
  organization: string;
  docId: string;
  projectId: string;
  subprojectId: string;
  workflowitemId: string;
}

interface Repository {
  encryptWithKey(secret, publicKey): Promise<Result.Type<string>>;
  decryptWithKey(secret, privateKey): Promise<Result.Type<string>>;
  getPublicKey(organization): Promise<Result.Type<Base64String>>;
  getPrivateKey(organization): Promise<Result.Type<Base64String>>;
  getSecret(docId, organization): Promise<Result.Type<DocumentShared.SecretPublished>>;
  secretAlreadyExists(docId, organization): Promise<Result.Type<boolean>>;
  getWorkflowitem(
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getDocumentInfo(docId: string): Promise<Result.Type<StoredDocument | undefined>>;
}

export async function shareDocument(
  ctx: Ctx,
  issuer: ServiceUser,
  requestData: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent | undefined>> {
  logger.trace({ req: requestData }, "Sharing document");
  const { organization, docId, projectId, subprojectId, workflowitemId } = requestData;
  const publisherOrganization = config.organization;

  logger.trace("Checking if secret for this document and organization is already published");
  // if secret is already published for this document and organization no event is created
  const alreadyPublished = await repository.secretAlreadyExists(docId, organization);
  if (alreadyPublished) {
    logger.debug(
      { docId, publisherOrganization },
      "Secret is already shared with this organization",
    );
    return undefined;
  }

  const workflowitem = await repository.getWorkflowitem(projectId, subprojectId, workflowitemId);
  if (Result.isErr(workflowitem)) {
    return new VError(" Error while fetching workflowitem!");
  }

  const { documents } = workflowitem;
  if (!documents.some((doc) => doc.id === docId)) {
    return new VError(`No documents with id ${docId} found in workflowitem ${workflowitemId}`);
  }
  const documentInfo = await repository.getDocumentInfo(docId);
  if (!documentInfo) {
    logger.debug({ docId, workflowitemId }, "No such document attached to this workflowitem");
    return undefined;
  }

  logger.trace(
    { docId, publisherOrganization },
    "Getting the secret for document and the organization of the publisher",
  );
  const secret = await repository.getSecret(docId, publisherOrganization);
  if (Result.isErr(secret)) {
    return new VError(secret, "cannot get secret for this document and organization");
  }

  const privateKeyBase64Result = await repository.getPrivateKey(config.organization);
  if (Result.isErr(privateKeyBase64Result)) {
    return new VError(privateKeyBase64Result, "cannot get private key");
  }

  const privateBuff = Buffer.from(privateKeyBase64Result, "base64");
  const privateKey = privateBuff.toString("utf8");

  logger.trace("decrypt secret with own private key");
  // decrypt secret with own private key
  const decryptedSecret = await repository.decryptWithKey(secret.encryptedSecret, privateKey);
  if (Result.isErr(decryptedSecret)) {
    return new VError(decryptedSecret, "failed to decrypt secret");
  }

  logger.trace({ organization }, "Getting public key of organization");
  const publicKeyBase64 = await repository.getPublicKey(organization);
  if (Result.isErr(publicKeyBase64)) {
    return new VError(publicKeyBase64, "failed to get public key");
  }

  const publicBuff = Buffer.from(publicKeyBase64, "base64");
  const publicKey = publicBuff.toString("utf8");

  logger.trace(
    "Encrypting secret with the public key of the organization the document is shared with",
  );
  // encrypt secret with public key of the organization the document is shared with
  const encryptedSecret = await repository.encryptWithKey(decryptedSecret, publicKey);
  if (Result.isErr(encryptedSecret)) {
    return new VError(encryptedSecret, "failed to encrypt secret");
  }

  logger.trace("Creating new secret publishded event");
  const newSecretPublishedEvent = DocumentShared.createEvent(
    ctx.source,
    issuer.id,
    docId,
    organization,
    encryptedSecret,
    new Date().toISOString(),
    issuer.metadata,
  );

  if (Result.isErr(newSecretPublishedEvent)) {
    return new VError(newSecretPublishedEvent, "cannot publish document secret");
  }

  if (issuer.id === "root") {
    return new PreconditionError(
      ctx,
      newSecretPublishedEvent,
      "user 'root' is not allowed to share documents",
    );
  }

  const intent = "workflowitem.intent.grantPermission";

  logger.trace(
    { issuer, intent, workflowitem },
    "Checking if issuer has permission for intent on workflowite",
  );
  if (!Workflowitem.permits(workflowitem, issuer, [intent])) {
    return new NotAuthorized({ ctx, userId: issuer.id, intent, target: workflowitem });
  }

  return newSecretPublishedEvent;
}
