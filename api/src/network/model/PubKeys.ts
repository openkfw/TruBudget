import logger from "../../lib/logger";
import { publicKey } from "../../config";
import { MultichainClient } from "../../service/Client.h";
import * as PublicKeyCreated from "../../service/domain/organization/publickey_published";
import * as Liststreamkeyitems from "../../service/liststreamkeyitems";
import * as Result from "../../result";

const streamName = "pubkeys";

export type WalletAddress = string;
export type PublicKey = string;
export type Organization = string;
export type NetworkPermission =
  | "connect"
  | "send"
  | "receive"
  | "issue"
  | "create"
  | "mine"
  | "activate"
  | "admin";

export interface OrganizationPublicKey {
  organization: Organization;
  publicKey: PublicKey;
}

interface Event {
  type: string;
  source: string;
  publisher: string;
  organization: Organization;
  publicKey: PublicKey;
  time: string;
}

export async function publish(
  multichain: MultichainClient,
  organization: Organization,
  publicKey: PublicKey,
): Promise<Event> {
  logger.info("Publishing public key ", publicKey);
  const event = PublicKeyCreated.createEvent("system", "system", organization, publicKey);
  const streamItem = { json: event };

  const publishEvent = () => {
    logger.debug(`Publishing to ${streamName}`);
    return multichain
      .getRpcClient()
      .invoke("publish", streamName, organization, streamItem)
      .then(() => event);
  };

  return publishEvent().catch((err) => {
    if (err.code === -708) {
      // The stream does not exist yet. Create the stream and try again:
      logger.debug(
        `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
      );
      return multichain
        .getOrCreateStream({ kind: "nodes", name: streamName })
        .then(() => publishEvent());
    } else {
      logger.error({ error: err }, "Publishing failed.");
      throw err;
    }
  });
}

export async function getAll(multichain: MultichainClient): Promise<Event[]> {
  const streamItems: Liststreamkeyitems.Item[] = await multichain
    .v2_readStreamItems(streamName, "*")
    .catch((err) => {
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

  const keyByOrganization = streamItems.map((item) => {
    return item.data.json;
  });

  return keyByOrganization;
}

export async function getPublicKeyOfOrganization(
  multichain: MultichainClient,
  organization: Organization,
): Promise<Result.Type<PublicKey>> {
  // get all public keys
  const publicKeys = await getAll(multichain);

  const organizationPublicKey = publicKeys.find((pubKey) => pubKey.organization === organization);
  if (!organizationPublicKey) {
    let notFoundError = new Error(`public key for ${organization} not found`);
    notFoundError.name = "NotFound";
    return notFoundError;
  }
  return organizationPublicKey.publicKey;
}

export async function ensurePublishKeyPublished(
  multichain: MultichainClient,
  organization: Organization,
): Promise<Result.Type<PublicKey>> {
  await multichain.getOrCreateStream({
    kind: "nodes",
    name: streamName,
  });

  let organizationPublicKeyResult = await getPublicKeyOfOrganization(multichain, organization);
  if (Result.isErr(organizationPublicKeyResult)) {
    // No public key published
    if (organizationPublicKeyResult.name === "NotFound") {
      try {
        // TODO change return value to result
        logger.info("No public key published yet.");
        await publish(multichain, organization, publicKey);
        return publicKey;
      } catch (error) {
        return error;
      }
    }
    return organizationPublicKeyResult;
  }
  logger.info("Public key of organization: ", organizationPublicKeyResult);
  return organizationPublicKeyResult;
}
