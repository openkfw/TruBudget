let jwt = require("jsonwebtoken");

function createJWT(secret, id, algorithm = "HS256") {
  const secretOrPrivateKey = algorithm === "RS256" ? Buffer.from(secret, "base64") : secret;
  return jwt.sign(
    {
      id,
    },
    secretOrPrivateKey,
    { expiresIn: "8h", algorithm },
  );
}

module.exports = {
  createJWT,
};
