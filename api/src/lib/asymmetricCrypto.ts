import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs";

export function encryptWithKey(toEncrypt, publicKeyPath) {
  const absolutePath = path.resolve(publicKeyPath);
  const publicKey = fs.readFileSync(absolutePath, "utf8");
  const buffer = Buffer.from(toEncrypt, "utf8");
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

export function decryptWithKey(toDecrypt, privateKeyPath) {
  const absolutePath = path.resolve(privateKeyPath);
  const privateKey = fs.readFileSync(absolutePath, "utf8");
  const buffer = Buffer.from(toDecrypt, "base64");
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
      passphrase: "",
    },
    buffer,
  );
  return decrypted.toString("utf8");
}

export function encryptWithKeyPath(toEncrypt, publicKeyPath) {
  const absolutePath = path.resolve(publicKeyPath);
  const publicKey = fs.readFileSync(absolutePath, "utf8");
  const buffer = Buffer.from(toEncrypt, "utf8");
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

export function decryptWithKeyPath(toDecrypt, privateKeyPath) {
  const absolutePath = path.resolve(privateKeyPath);
  const privateKey = fs.readFileSync(absolutePath, "utf8");
  const buffer = Buffer.from(toDecrypt, "base64");
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
      passphrase: "",
    },
    buffer,
  );
  return decrypted.toString("utf8");
}
