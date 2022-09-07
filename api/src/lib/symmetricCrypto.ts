import { VError } from "verror";
import * as Result from "../result";
import logger from "./logger";
const sodium = require("sodium-native");

class DecryptionFailed extends VError {
  constructor() {
    super({ name: "DecryptionFailed" }, "decryption failed");
  }
}

/** Decrypts a hex-encoded ciphertext and returns the resulting string. */
export function decrypt(
  organizationSecret: string,
  hexEncodedCiphertext: string,
): Result.Type<string> {
  // The nonce/salt is prepended to the actual ciphertext:
  const dataBuffer = Buffer.from(hexEncodedCiphertext, "hex");
  const nonceBuffer = dataBuffer.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const cipherBuffer = dataBuffer.slice(sodium.crypto_secretbox_NONCEBYTES);

  const keyBuffer = toKeyBuffer(organizationSecret);

  const plaintextBuffer = Buffer.alloc(cipherBuffer.length - sodium.crypto_secretbox_MACBYTES);
  if (!sodium.crypto_secretbox_open_easy(plaintextBuffer, cipherBuffer, nonceBuffer, keyBuffer)) {
    return new DecryptionFailed();
  }

  return plaintextBuffer.toString();
}

/** Encrypts a string and returns resulting hex-encoded ciphertext. */
export function encrypt(organizationSecret: string, plaintext: string): string {
  const plaintextBuffer = Buffer.from(plaintext);

  // The nonce/salt will be prepended to the ciphertext:
  const dataBuffer = Buffer.alloc(
    sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES + plaintextBuffer.length,
  );

  // A new nonce/salt is used every time the vault is updated:
  const nonceBuffer = dataBuffer.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  sodium.randombytes_buf(nonceBuffer);

  const keyBuffer = toKeyBuffer(organizationSecret);

  const cipherBuffer = dataBuffer.slice(sodium.crypto_secretbox_NONCEBYTES);
  sodium.crypto_secretbox_easy(cipherBuffer, plaintextBuffer, nonceBuffer, keyBuffer);

  return dataBuffer.toString("hex");
}

function toKeyBuffer(secret: string): Buffer {
  if (secret.length > sodium.crypto_secretbox_KEYBYTES) {
    logger.warn(
      `truncate secret with length ${secret.length} to length ${sodium.crypto_secretbox_KEYBYTES}`,
    );
  }

  const key = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES);
  key.write(secret.slice(0, sodium.crypto_secretbox_KEYBYTES));

  return key;
}
