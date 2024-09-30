import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotFound } from "../errors/not_found";

import { sourceSecrets } from "./document_eventsourcing";
import * as DocumentShared from "./document_shared";

interface Repository {
  getSecretPublishedEvents(): Promise<Result.Type<BusinessEvent[]>>;
}

export async function getAllSecrets(
  ctx: Ctx,
  repository: Repository,
): Promise<Result.Type<DocumentShared.SecretPublished[]>> {
  logger.trace("Getting all secrets");
  const secretEvents = await repository.getSecretPublishedEvents();
  if (Result.isErr(secretEvents)) {
    return new VError(secretEvents, "fetch secrets_published events failed");
  }
  const { secrets } = sourceSecrets(ctx, secretEvents);
  return secrets;
}

export async function getSecret(
  ctx: Ctx,
  docId: string,
  organization: string,
  repository: Repository,
): Promise<Result.Type<DocumentShared.SecretPublished>> {
  const secrets = await getAllSecrets(ctx, repository);
  if (Result.isErr(secrets)) {
    return new VError(secrets, "get all secrets from stream failed");
  }
  const secret = secrets.find(
    (secret) => secret.docId === docId && secret.organization === organization,
  );
  if (!secret) {
    return new VError(
      new NotFound(ctx, "secret", docId),
      `couldn't get secret for document ${docId} and organization ${organization}`,
    );
  }
  return secret;
}

export async function secretAlreadyExists(
  ctx: Ctx,
  docId: string,
  organization: string,
  repository: Repository,
): Promise<Result.Type<boolean>> {
  const secrets = await getAllSecrets(ctx, repository);
  if (Result.isErr(secrets)) {
    return new VError(secrets, "get all secrets from stream failed");
  }
  const secret = secrets.find(
    (secret) => secret.docId === docId && secret.organization === organization,
  );
  return secret !== undefined;
}
