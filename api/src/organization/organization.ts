import { VError } from "verror";
import logger from "../lib/logger";
import * as SymmetricCrypto from "../lib/symmetricCrypto";
import { Organization, WalletAddress } from "../network/model/Nodes";
import * as Result from "../result";
import { MultichainClient } from "../service/Client.h";
import { organizationStreamName } from "./streamNames";

type Base64String = string;

interface GetaddressesItem {
  address: string;
  ismine: boolean;
  iswatchonly: boolean;
  isscript: boolean;
  pubkey: string;
  iscompressed: boolean;
  account: string;
  synchronized: boolean;
}

interface OrganizationAddressItem {
  address: WalletAddress;
  privkey: string;
}

interface PrivateKeyItem {
  privateKey: string;
}

export async function ensureOrganizationStream(
  multichain: MultichainClient,
  organization: Organization,
  organizationVaultSecret: string,
): Promise<string> {
  await multichain.getOrCreateStream({
    kind: "organization",
    name: organizationStreamName(organization),
  });

  return ensureOrganizationAddress(multichain, organization, organizationVaultSecret);
}

async function getPrivateKeyItem(
  multichain: MultichainClient,
  organization: Organization,
): Promise<Result.Type<PrivateKeyItem>> {
  const streamName = organizationStreamName(organization);
  const streamKey = "privateKey";
  const privateKeyItem = await multichain
    .v2_readStreamItems(streamName, streamKey, 1)
    .then((items) => items.map((x) => x.data.json))
    .then((items) => items.find((_) => true))
    .catch((error) => {
      return error;
    });
  if (!privateKeyItem) {
    const notFoundError = new Error("private key not found");
    notFoundError.name = "NotFound";
    return notFoundError;
  }
  return privateKeyItem;
}

export async function getPrivateKey(
  multichain: MultichainClient,
  organization: Organization,
  organizationVaultSecret: string,
): Promise<Result.Type<Base64String>> {
  logger.trace("Fetching organisation address item...");
  const privateKeyItemResult = await getPrivateKeyItem(multichain, organization);
  if (Result.isErr(privateKeyItemResult)) {
    if (VError.hasCauseWithName(privateKeyItemResult, "NotFound")) {
      return privateKeyItemResult;
    }
    logger.trace("cannot get organization address item", privateKeyItemResult);
    return new Error("cannot get organization address item");
  }
  logger.trace("Decrypting organisation address item...");

  const decryptedPrivateKeyResult = SymmetricCrypto.decrypt(
    organizationVaultSecret,
    privateKeyItemResult.privateKey,
  );
  if (Result.isErr(decryptedPrivateKeyResult)) {
    return new VError(decryptedPrivateKeyResult, "cannot decrypt private key");
  }
  const buffer = Buffer.from(decryptedPrivateKeyResult, "utf8");
  const privateKey = buffer.toString("base64");
  return privateKey;
}

export async function publishPrivateKey(
  multichain: MultichainClient,
  organization: Organization,
  privateKey: string,
  organizationVaultSecret: string,
): Promise<Result.Type<PrivateKeyItem>> {
  logger.trace("Publish organisation privat key...");
  const privateKeyItemResult = await getPrivateKeyItem(multichain, organization);
  if (Result.isOk(privateKeyItemResult)) {
    logger.info("Private Key already published.");
    const error = new VError("cannot publish private key, a private key is already published");
    error.name = "AlreadyExists";
    return error;
  }
  if (VError.hasCauseWithName(privateKeyItemResult, "NotFound")) {
    privateKey = privateKey.replace(/\\n/gm, "\n");
    const encryptedHexPrivateKey = SymmetricCrypto.encrypt(organizationVaultSecret, privateKey);
    const streamName = organizationStreamName(organization);
    const streamItemKey = "privateKey";
    const privateKeyItem: PrivateKeyItem = {
      privateKey: encryptedHexPrivateKey,
    };
    const streamItem = { json: privateKeyItem };
    logger.trace(`Publishing private key to ${streamName}/${streamItemKey}`);
    await multichain.getRpcClient().invokePublish(streamName, streamItemKey, streamItem);
    return privateKeyItem;
  } else {
    // Non expected error
    logger.trace("Publish organisation address ended with an unexpected error!");

    return new VError(privateKeyItemResult, "cannot publish private key");
  }
}

async function ensureOrganizationAddress(
  multichain: MultichainClient,
  organization: Organization,
  organizationVaultSecret: string,
): Promise<string> {
  logger.trace("Ensuring organisation address...");

  const addressFromStream = await getOrganizationAddressItem(multichain, organization);
  let organizationAddress: string | undefined;
  if (addressFromStream) {
    // The organization already has its address set -> no need to use the local wallet
    // address.
    logger.debug(`Organization address already set: ${addressFromStream.address}`);
    const privkey = SymmetricCrypto.decrypt(organizationVaultSecret, addressFromStream.privkey);
    if (Result.isErr(privkey)) {
      throw new VError(
        { cause: privkey, info: { organization } },
        "organization setup: cannot decrypt organization key",
      );
    }
    await multichain.getRpcClient().invoke("importprivkey", privkey);
    organizationAddress = addressFromStream.address;
  } else {
    // Find the local wallet address and use it as the organization address:
    const addressFromWallet: string | undefined = await multichain
      .getRpcClient()
      // Retrive the oldest address:
      .invoke("listaddresses", "*", false, 1, 0)
      .then((addressInfos) =>
        addressInfos
          .filter((info: GetaddressesItem) => info.ismine)
          .map((info: GetaddressesItem) => info.address)
          .find((_) => true),
      );
    if (!addressFromWallet) {
      throw new VError(
        { info: { organization } },
        "organization address not yet set, but local wallet address could not be retrieved either",
      );
    }

    const privkeyCiphertext = await multichain
      .getRpcClient()
      .invoke("dumpprivkey", addressFromWallet)
      .then((plaintext) => SymmetricCrypto.encrypt(organizationVaultSecret, plaintext));

    logger.trace(`Initializing organization address to local wallet address: ${addressFromWallet}`);
    const streamName = organizationStreamName(organization);
    const streamItemKey = "address";
    const orgaAddressItem: OrganizationAddressItem = {
      address: addressFromWallet,
      privkey: privkeyCiphertext,
    };
    const streamItem = { json: orgaAddressItem };
    logger.trace(`Publishing wallet address to ${streamName}/${streamItemKey}`);
    await multichain.getRpcClient().invokePublish(streamName, streamItemKey, streamItem);
    organizationAddress = addressFromWallet;
  }
  logger.info(`Organization address ${organizationAddress} is ready to be used in transactions.`);
  return organizationAddress;
}

export async function organizationExists(
  multichain: MultichainClient,
  organization: Organization,
): Promise<Result.Type<boolean>> {
  try {
    return (await getOrganizationAddressItem(multichain, organization)) ? true : false;
  } catch (err) {
    return err;
  }
}

export async function getOrganizationAddress(
  multichain: MultichainClient,
  organization: Organization,
): Promise<WalletAddress | undefined> {
  const item = await getOrganizationAddressItem(multichain, organization);
  if (item) return item.address;
  else return undefined;
}

async function getOrganizationAddressItem(
  multichain: MultichainClient,
  organization: Organization,
): Promise<OrganizationAddressItem | undefined> {
  const streamName = organizationStreamName(organization);
  const streamItem = "address";
  const organizationAddressItem = multichain
    .v2_readStreamItems(streamName, streamItem, 1)
    .then((items) => items.map((x) => x.data.json))
    .then((items) => items.find((_) => true))
    .catch((error) => {
      if (error.kind !== "NotFound") throw error;
    });
  return organizationAddressItem;
}
