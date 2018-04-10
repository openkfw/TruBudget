const jsonwebtoken = require("jsonwebtoken");

const getUserToken = (userId, secret) =>
  jsonwebtoken.sign({ user: userId }, secret, { expiresIn: "1h" });

export const getRootToken = secret => getUserToken("root", secret);
