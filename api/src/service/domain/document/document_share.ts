import { VError } from "verror";
import { config } from "../../../config";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import * as DocumentShared from "./document_shared";
import * as Workflowitem from "../workflow/workflowitem";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";

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
}

export async function shareDocument(
  ctx: Ctx,
  issuer: ServiceUser,
  requestData: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent | undefined>> {
  const { organization, docId, projectId, subprojectId, workflowitemId } = requestData;
  const publisherOrganization = config.organization;

  // if secret is already published for this document and organization no event is created
  const alreadyPublished = await repository.secretAlreadyExists(docId, organization);
  if (alreadyPublished) {
    return undefined;
  }

  // get the secret for this docId and the organization of the publisher
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
  // decrypt secret with own private key
  const decryptedSecret = await repository.decryptWithKey(secret.encryptedSecret, privateKey);
  if (Result.isErr(decryptedSecret)) {
    return new VError(decryptedSecret, "failed to decrypt secret");
  }

  // get public key of the organization the document is shared with
  const publicKeyBase64 = await repository.getPublicKey(organization);
  if (Result.isErr(publicKeyBase64)) {
    return new VError(publicKeyBase64, "failed to get public key");
  }
  const publicBuff = Buffer.from(publicKeyBase64, "base64");
  const publicKey = publicBuff.toString("utf8");

  // encrypt secret with public key of the organization the document is shared with
  const encryptedSecret = await repository.encryptWithKey(decryptedSecret, publicKey);
  if (Result.isErr(encryptedSecret)) {
    return new VError(encryptedSecret, "failed to encrypt secret");
  }

  // create secret event
  const newSecretPublishedEvent = DocumentShared.createEvent(
    ctx.source,
    issuer.id,
    docId,
    organization,
    encryptedSecret,
  );
  if (Result.isErr(newSecretPublishedEvent)) {
    return new VError(newSecretPublishedEvent, "cannot publish document secret");
  }

  if (issuer.id !== "root") {
    // check if issuer has the workflowitem.intent.grantPermission permission to be allowed to share documents
    const workflowitemResult = await repository.getWorkflowitem(
      projectId,
      subprojectId,
      workflowitemId,
    );
    if (Result.isErr(workflowitemResult)) {
      return new VError(" Error while fetching workflowitem!");
    }
    const workflowitem = workflowitemResult;
    const intent = "workflowitem.intent.grantPermission";
    if (!Workflowitem.permits(workflowitem, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: workflowitem });
    }
  } else {
    return new PreconditionError(
      ctx,
      newSecretPublishedEvent,
      "user 'root' is not allowed to share documents",
    );
  }

  return newSecretPublishedEvent;
}
