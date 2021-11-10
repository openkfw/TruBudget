// Use this file to check the private key decryption with the orga vault secret
// Get organization vault secret and insert it
// Get private key in hex from chain and insert it (on chain)
// start file with node decryptprivkey.js
const sodium = require("sodium-native");
try {
  const organizationSecret = "ker5Ecety";
  let privateKey = "insert private key here";
  console.log(privateKey);
  const encryptResult = encrypt(organizationSecret, privateKey);
  console.log(encryptResult);
  const decryptResult = decrypt(organizationSecret, encryptResult);
  console.log(decryptResult);
} catch (err) {
  console.log(err);
}

function encrypt(organizationSecret, plaintext) {
  logger.trace("Encrypting organization secret ...");

  const plaintextBuffer = Buffer.from(plaintext);

  // The nonce/salt will be prepended to the ciphertext:
  const dataBuffer = Buffer.alloc(
    sodium.crypto_secretbox_NONCEBYTES +
      sodium.crypto_secretbox_MACBYTES +
      plaintextBuffer.length,
  );

  // A new nonce/salt is used every time the vault is updated:
  const nonceBuffer = dataBuffer.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  sodium.randombytes_buf(nonceBuffer);

  const keyBuffer = toKeyBuffer(organizationSecret);

  const cipherBuffer = dataBuffer.slice(sodium.crypto_secretbox_NONCEBYTES);
  sodium.crypto_secretbox_easy(
    cipherBuffer,
    plaintextBuffer,
    nonceBuffer,
    keyBuffer,
  );

  return dataBuffer.toString("hex");
}

function decrypt(organizationSecret, hexEncodedCiphertext) {
  // The nonce/salt is prepended to the actual ciphertext:
  logger.trace("Decreypting organization secret ...");

  const dataBuffer = Buffer.from(hexEncodedCiphertext, "hex");
  const nonceBuffer = dataBuffer.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const cipherBuffer = dataBuffer.slice(sodium.crypto_secretbox_NONCEBYTES);

  const keyBuffer = toKeyBuffer(organizationSecret);
  const plaintextBuffer = Buffer.alloc(
    cipherBuffer.length - sodium.crypto_secretbox_MACBYTES,
  );
  if (
    !sodium.crypto_secretbox_open_easy(
      plaintextBuffer,
      cipherBuffer,
      nonceBuffer,
      keyBuffer,
    )
  ) {
    logger.trace("Encrypting organization secret failed!");
    return new Error("decryption failed");
  }

  return plaintextBuffer.toString();
}

function toKeyBuffer(secret) {
  if (secret.length > sodium.crypto_secretbox_KEYBYTES) {
    logger.warn(
      `truncate secret with length ${secret.length} to length ${sodium.crypto_secretbox_KEYBYTES}`,
    );
  }

  const key = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES);
  key.write(secret.slice(0, sodium.crypto_secretbox_KEYBYTES));

  return key;
}
