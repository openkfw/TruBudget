import { VError } from "verror";
import { config } from "../config";
import { decryptWithKey, encryptWithKey } from "../lib/asymmetricCrypto";
import { Ctx } from "../lib/ctx";
import * as PrivateKeyGet from "../organization/organization";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { sourceSecrets } from "./domain/document/document_eventsourcing";
import * as DocumentShare from "./domain/document/document_share";
import * as SecretGet from "./domain/document/secret_get";
import { ServiceUser } from "./domain/organization/service_user";
import * as PublicKeyGet from "./public_key_get";
import { store } from "./store";
import * as UserQuery from "./user_query";

export async function documentShare(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: DocumentShare.RequestData,
): Promise<Result.Type<void>> {
  const sharedDocumentResult = await Cache.withCache(conn, ctx, async (cache) => {
    return DocumentShare.shareDocument(ctx, serviceUser, requestData, {
      encryptWithKey: async (secret, publicKey) => {
        return encryptWithKey(secret, publicKey);
      },
      decryptWithKey: async (secret, privateKey) => {
        return decryptWithKey(secret, privateKey);
      },
      getPublicKey: async (organization) => {
        return PublicKeyGet.getPublicKey(conn, ctx, organization);
      },
      getPrivateKey: async (organization) => {
        return PrivateKeyGet.getPrivateKey(
          conn.multichainClient,
          organization,
          config.organizationVaultSecret,
        );
      },
      getSecret: async (docId, organization) => {
        return SecretGet.getSecret(ctx, docId, organization, {
          getSecretPublishedEvents: async () => {
            return cache.getSecretPublishedEvents();
          },
        });
      },
      secretAlreadyExists: async (docId, organization) => {
        return SecretGet.secretAlreadyExists(ctx, docId, organization, {
          getSecretPublishedEvents: async () => {
            return cache.getSecretPublishedEvents();
          },
        });
      },
      getWorkflowitem: async (projectId, subprojectId, workflowitemId) => {
        return cache.getWorkflowitem(projectId, subprojectId, workflowitemId);
      },
    });
  });

  if (Result.isErr(sharedDocumentResult))
    return new VError(sharedDocumentResult, "share document failed");
  const newEvent = sharedDocumentResult;

  if (newEvent) {
    await store(conn, ctx, newEvent, serviceUser.address);

    const { secrets } = sourceSecrets(ctx, [newEvent]);
    const newSecret = secrets.find(
      (s) => s.organization === requestData.organization && s.docId === requestData.docId,
    );

    if (!newSecret) {
      return new Error("The document was not shared");
    }
  }
}
