import { MultichainClient } from "../multichain";
import { WalletAddress } from "../network/model/Nodes";
import { organizationStreamName } from "./streamNames";

async function getPrivKey(
  multichain: MultichainClient,
  organization: string,
  organizationVaultSecret: string,
  address: WalletAddress,
) {
  const rpc = multichain.getRpcClient();

  const stream = organizationStreamName(organization);
  const vaultCiphertext = await multichain
    .v2_readStreamItems(stream, "vault", 1)
    .then(items => items.find(_ => true));
  if (vaultCiphertext === undefined)
    throw Error(`privkey not found for ${organization}/${address}`);

  const vault = decrypt(vaultCiphertext);
}

// const sodium = require("sodium-native")

// const secret = (process.env.SECRET || "").slice(0, sodium.crypto_secretbox_KEYBYTES)
// console.log("KEYBYTES LEN", sodium.crypto_secretbox_KEYBYTES)
// console.log("SECRET", secret)

// const key = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES)
// key.write(secret)

// const nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
// sodium.randombytes_buf(nonce)

// const message = Buffer.from("Hello, World!")

// const cipher = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES)
// sodium.crypto_secretbox_easy(cipher, message, nonce, key)

// console.log("encrypted:", cipher)

// const plaintext = Buffer.alloc(cipher.length - sodium.crypto_secretbox_MACBYTES)

// if (!sodium.crypto_secretbox_open_easy(plaintext, cipher, nonce, key)) {
//   console.log('Decryption failed!')
// } else {
//   console.log('Decrypted message:', plaintext, '(' + plaintext.toString() + ')')
// }
