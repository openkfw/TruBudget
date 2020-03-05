var jwt = require("jsonwebtoken");

function createJWT(secret, id) {
  return jwt.sign(
    {
      id,
    },
    secret,
    { expiresIn: "8h" },
  );
}

module.exports = {
  createJWT,
};
