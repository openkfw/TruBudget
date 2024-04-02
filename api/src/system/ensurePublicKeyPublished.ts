import * as crypto from "crypto";
import { VError } from "verror";
import { config } from "../config";
import * as AsymmetricCrypto from "../lib/asymmetricCrypto";
import * as SymmetricCrypto from "../lib/symmetricCrypto";
import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import { getPrivateKey, publishPrivateKey } from "../organization/organization";
import * as Result from "../result";
import { ConnToken } from "../service/conn";
import { ServiceUser } from "../service/domain/organization/service_user";
import { getPublicKey } from "../service/public_key_get";
import { publishPublicKey } from "../service/public_key_publish";
import { getselfaddress } from "../service/getselfaddress";

type PublicKey = string;
type Organization = string;
interface KeyPair {
  publicKey: string;
  privateKey: string;
}

const isKeyValid = (privateKey: string, publicKey: string): boolean => {
  const testKeyString = "TESTKEYSTRING";
  try {
    const encryptedString = AsymmetricCrypto.encryptWithKey(testKeyString, publicKey);
    const decryptedString = AsymmetricCrypto.decryptWithKey(encryptedString, privateKey);
    return decryptedString === testKeyString;
  } catch (error) {
    throw new VError(error, "Key validation failed");
  }
};

const generateKeyPairAsPromised = async (): Promise<KeyPair> => {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      "rsa",
      {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      },
      (err, publicKey, privateKey) => {
        if (err) return reject(err);
        resolve({ publicKey, privateKey });
      },
    );
  });
};

export default async function ensurePublicKeyPublished(
  conn: ConnToken,
  organization: Organization,
): Promise<Result.Type<PublicKey>> {
  const ctx: Ctx = { requestId: "system", source: "internal" };

  const nodeAddress = await getselfaddress(conn.multichainClient);
  const serviceUser: ServiceUser = { id: "system", address: nodeAddress };

  // check if public key exists else return
  let organizationPublicKeyResult = await getPublicKey(conn, ctx, organization);
  if (Result.isErr(organizationPublicKeyResult)) {
    // No public key published so publish the new one
    if (VError.hasCauseWithName(organizationPublicKeyResult, "NotFound")) {
      // Check if private key exists then generate public key and publish this key
      const organizationPrivateKeyResult = await getPrivateKey(
        conn.multichainClient,
        organization,
        config.organizationVaultSecret,
      );
      if (Result.isOk(organizationPrivateKeyResult)) {
        const privateKey = organizationPrivateKeyResult;
        // generate public key from private key and publish
        logger.info("Private key already exists, but no derived public key.");
        let publicKeyObject: crypto.KeyObject;
        try {
          logger.info("Create a new public key from existing private key...");
          publicKeyObject = crypto.createPublicKey(organizationPrivateKeyResult);
        } catch (error) {
          return new VError(error, "cannot create public key");
        }
        const publicKey = publicKeyObject.export({ type: "spki", format: "pem" }).toString();
        logger.trace("New public key of organization:\n", publicKey);
        isKeyValid(privateKey, publicKey);
        logger.trace("Public and private key validation successful.");
        logger.trace("Publishing newly generated public key...");
        const publishPublicKeyResult = await publishPublicKey(conn, ctx, serviceUser, {
          organization,
          publicKey,
        });
        if (Result.isErr(publishPublicKeyResult)) {
          return new VError(publishPublicKeyResult, "publish public key failed");
        }
        logger.info("Key successfully published.");
        return publishPublicKeyResult.publicKey;
      } else {
        if (VError.hasCauseWithName(organizationPrivateKeyResult, "NotFound")) {
          // else generate keypair and publish
          logger.info("No public and private key are published yet. Generating key pair...");
          const { publicKey, privateKey } = await generateKeyPairAsPromised();
          logger.trace("New public key of organization:\n", publicKey);
          logger.trace(
            "New private key of organization (encoded with ORGANIZATION_VAULT_SECRET):\n",
            SymmetricCrypto.encrypt(config.organizationVaultSecret, privateKey),
          );
          isKeyValid(privateKey, publicKey);
          logger.trace("Public and private key validation successful.");
          logger.trace("Publishing newly generated private key...");
          const publishPrivateKeyResult = await publishPrivateKey(
            conn.multichainClient,
            organization,
            privateKey,
            config.organizationVaultSecret,
          );
          if (Result.isErr(publishPrivateKeyResult)) {
            return new VError(publishPrivateKeyResult, "publish private key failed");
          }
          logger.trace("Publishing newly generated public key...");
          const publishPublicKeyResult = await publishPublicKey(conn, ctx, serviceUser, {
            organization,
            publicKey,
          });
          if (Result.isErr(publishPublicKeyResult)) {
            return new VError(publishPublicKeyResult, "publish public key failed");
          }
          logger.info("Keys successfully published.");
          return publicKey;
        }
        return new VError(organizationPrivateKeyResult, "Error while getting the private key");
      }
    }
    return new VError(organizationPublicKeyResult, "Error while getting the public key");
  }
  logger.trace("Public key of organization:\n", organizationPublicKeyResult);
  return organizationPublicKeyResult;
}
