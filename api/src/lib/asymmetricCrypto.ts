import * as crypto from "crypto";

import { VError } from "verror";

import * as Result from "../result";

export function encryptWithKey(toEncrypt, publicKey): Result.Type<string> {
  try {
    const buffer = Buffer.from(toEncrypt, "utf8");
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString("base64");
  } catch (error) {
    return new VError(error, "Encryption failed");
  }
}

export function decryptWithKey(toDecrypt, privateKey): Result.Type<string> {
  try {
    const buffer = Buffer.from(toDecrypt, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey.toString(),
        passphrase: "",
      },
      buffer,
    );
    return decrypted.toString("utf8");
  } catch (error) {
    return new VError(error, "Decryption failed");
  }
}
