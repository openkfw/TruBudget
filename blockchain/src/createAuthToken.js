var jwt = require("jsonwebtoken");

function createJWT(secret, id) {
  return jwt.sign(
    {
      id,
    },
    secret,
  );
}

module.exports = {
  createJWT,
};
