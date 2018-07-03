import * as sodium from "sodium-native";
import * as winston from "winston";
import { MultichainClient } from "../multichain";
import { WalletAddress } from "../network/model/Nodes";
import { organizationStreamName } from "./streamNames";
import logger from "../lib/logger";

export type Vault = object;
type PrivateKey = string;

const streamVaultKey = "vault";

/*
 * API
 */

export async function getPrivKey(
  multichain: MultichainClient,
  organization: string,
  organizationVaultSecret: string,
  address: WalletAddress,
): Promise<PrivateKey> {
  const vault = await readVault(multichain, organization, organizationVaultSecret);

  if (vault === undefined || !vault[address]) {
    throw Error(`privkey not found for ${organization}/${address}`);
  }

  return vault[address];
}

export async function setPrivKey(
  multichain: MultichainClient,
  organization: string,
  organizationVaultSecret: string,
  address: WalletAddress,
  privKey: PrivateKey,
) {
  const vault = (await readVault(multichain, organization, organizationVaultSecret)) || {};
  vault[address] = privKey;
  await writeVault(multichain, organization, organizationVaultSecret, vault);
}

/*
 * PRIVATE
 */

async function readVault(
  multichain: MultichainClient,
  organization: string,
  organizationVaultSecret: string,
): Promise<Vault> {
  const streamName = organizationStreamName(organization);
  const vaultStreamItem = await multichain
    .v2_readStreamItems(streamName, streamVaultKey, 1)
    .then(items => items.find(_ => true));

  if (vaultStreamItem === undefined) return {};

  const dataHexString = vaultStreamItem.data;
  logger.trace("read hex string from chain: %s", dataHexString);

  return vaultFromHexString(organizationVaultSecret, dataHexString);
}

async function writeVault(
  multichain: MultichainClient,
  organization: string,
  organizationVaultSecret: string,
  vault: Vault,
): Promise<void> {
  const dataHexString = vaultToHexString(organizationVaultSecret, vault);

  const streamName = organizationStreamName(organization);
  await multichain.getRpcClient().invoke("publish", streamName, streamVaultKey, dataHexString);
  logger.trace("wrote hex string to chain: %s", dataHexString);
}

// only exported for testing
export function vaultFromHexString(organizationVaultSecret: string, dataHexString: string): Vault {
  // The nonce/salt is prepended to the actual ciphertext:
  const dataBuffer = Buffer.from(dataHexString, "hex");
  const nonceBuffer = dataBuffer.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const cipherBuffer = dataBuffer.slice(sodium.crypto_secretbox_NONCEBYTES);

  const keyBuffer = toKeyBuffer(organizationVaultSecret);

  const plaintextBuffer = Buffer.alloc(cipherBuffer.length - sodium.crypto_secretbox_MACBYTES);
  if (!sodium.crypto_secretbox_open_easy(plaintextBuffer, cipherBuffer, nonceBuffer, keyBuffer)) {
    throw Error("Vault decryption failed!");
  }

  const vaultString = plaintextBuffer.toString();
  const vault: Vault = JSON.parse(vaultString);
  return vault;
}

// only exported for testing
export function vaultToHexString(organizationVaultSecret: string, vault: Vault): string {
  const vaultString = JSON.stringify(vault);
  const plaintextBuffer = Buffer.from(vaultString);

  // The nonce/salt will be prepended to the ciphertext:
  const dataBuffer = Buffer.alloc(
    sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES + vaultString.length,
  );

  // A new nonce/salt is used every time the vault is updated:
  const nonceBuffer = dataBuffer.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  sodium.randombytes_buf(nonceBuffer);

  const keyBuffer = toKeyBuffer(organizationVaultSecret);

  const cipherBuffer = dataBuffer.slice(sodium.crypto_secretbox_NONCEBYTES);
  sodium.crypto_secretbox_easy(cipherBuffer, plaintextBuffer, nonceBuffer, keyBuffer);

  return dataBuffer.toString("hex");
}

function toKeyBuffer(secret: string): Buffer {
  if (secret.length > sodium.crypto_secretbox_KEYBYTES) {
    winston.warn(
      `truncate secret with length ${secret.length} to length ${sodium.crypto_secretbox_KEYBYTES}`,
    );
  }

  const key = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES);
  key.write(secret.slice(0, sodium.crypto_secretbox_KEYBYTES));

  return key;
}
