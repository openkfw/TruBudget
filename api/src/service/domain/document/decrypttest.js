// Use this file to check if the secret published is valid
// Get secret base64 encoded and encrypted with public key and insert it
// Get private key (print it out while api startup) and insert it
// start file with node decrypttest.js
let crypto;
try {
  crypto = require("crypto");
  const secret = "insert secret here";
  const buffer = Buffer.from(secret, "base64");
  console.log(buffer);
  const decrypted = crypto.privateDecrypt(
    {
      key: "insert private key here",
      passphrase: "",
    },
    buffer,
  );
  console.log(decrypted.toString("utf8"));
} catch (err) {
  console.log(err);
}
