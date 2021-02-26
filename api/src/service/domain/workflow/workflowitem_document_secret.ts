import crypto from "crypto";
import logger from "../../../lib/logger";
import { publicKey, organization } from "../../../config";
import { MultichainClient } from "../../Client.h";
import * as DocumentSecretPublished from "./workflowitem_document_secret_published";
import { getAll as getAllPublicKeys } from "../../../network/model/PubKeys";
import * as Liststreamkeyitems from "../../liststreamkeyitems";


const streamName = "document_secrets";

export type WalletAddress = string;
export type PublicKey = string;
export type Organization = string;
export type DocumentId = string;
export type DocumentSecretString = string;
export type EncryptedDocumentSecretString = string;
export type NetworkPermission =
  | "connect"
  | "send"
  | "receive"
  | "issue"
  | "create"
  | "mine"
  | "activate"
  | "admin";

export interface DocumentSecret{
  organization: Organization;
  documentId: DocumentId;
  encryptedSecret: EncryptedDocumentSecretString;
}

interface Event {
  type: string,
  source: string,
  publisher: string,
  organization: Organization,
  documentId: DocumentId,
  encryptedSecret: EncryptedDocumentSecretString,
  time: string,
}

export async function publish(
  multichain: MultichainClient,
  organizations: Organization[],
  documentId: DocumentId,
  secret: DocumentSecretString,
): Promise<Event | undefined> {
  if (!documentId) throw Error("Document ID missing");

  const publicKeys = await getAllPublicKeys(multichain);

  for (const organizationName of organizations) {
    const publicKey = publicKeys.find(key => key.organization === organizationName);
    if (!publicKey?.publicKey) {
      logger.error(`Public key for organization ${organizationName} is not stored correctly.`);
      break;
    }

    // first check if secret is already published
    const existingSecret = await getDocumentEncryptedSecret(multichain, documentId, organizationName);
    if (existingSecret) {
      continue;
    }

    const secretBuffer = Buffer.from(secret, "utf8");
    const encryptedSecret = crypto.publicEncrypt(publicKey?.publicKey, secretBuffer).toString();

    const event = DocumentSecretPublished.createEvent(
      "system",
      "system",
      organizationName,
      documentId,
      encryptedSecret,
    );
    const streamItem = { json: event };

    const publishEvent = () => {
      logger.debug(`Publishing to ${streamName}`);
      return multichain
        .getRpcClient()
        .invoke("publish", streamName, organization, streamItem)
        .then(() => event);
    };

    try {
      await publishEvent();
    } catch (err) {
      if (err.code === -708) {
        // The stream does not exist yet. Create the stream and try again:
        logger.debug(
          `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
        );
        await multichain.getOrCreateStream({ kind: "nodes", name: streamName });

        return await publishEvent();
      } else {
        logger.error({ error: err }, "Publishing failed.");
        throw err;
      }
    }

  }

}

export async function getAll(multichain: MultichainClient): Promise<Event[]> {
  const streamItems: Liststreamkeyitems.Item[] = await multichain
    .v2_readStreamItems(streamName, "*")
    .catch(err => {
      if (err.kind === "NotFound" && err.what === "stream nodes") {
        // The stream does not exist yet, which happens on (freshly installed) systems that
        // have not seen any notifications yet.
        logger.debug(`The stream ${streamName} does not exist yet.`);
        return [];
      } else {
        logger.error({ error: err }, "Getting stream items failed.");
        throw err;
      }
    });

  const itemsDetails = streamItems.map(item => {
    return item.data.json;
  });

  return itemsDetails;
}

export async function getDocumentEncryptedSecret(multichain: MultichainClient, documentId: Organization, org: Organization = organization): Promise<PublicKey | undefined> {
  // get all public keys
  const secrets = await getAll(multichain);

  const documentSecret = secrets.find(secret => secret.organization === org && secret.documentId === documentId);

  return documentSecret?.encryptedSecret;
}

