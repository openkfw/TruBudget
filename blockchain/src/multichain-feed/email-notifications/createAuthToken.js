const jwt = require("jsonwebtoken");

function createJWT(secret, id, algorithm = "HS256") {
  if (!secret || typeof secret !== "string") {
    throw new Error("Invalid or missing secret key.");
  }

  const supportedAlgorithms = ["HS256", "RS256"];
  if (!supportedAlgorithms.includes(algorithm)) {
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  const secretOrPrivateKey = algorithm === "RS256" ? Buffer.from(secret, "base64") : secret;

  try {
    return jwt.sign({ id }, secretOrPrivateKey, { expiresIn: "8h", algorithm });
  } catch (error) {
    throw new Error(`JWT creation failed: ${error.message}`);
  }
}

module.exports = {
  createJWT,
};
