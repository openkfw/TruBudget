import * as jsonwebtoken from "jsonwebtoken";

import { JwtConfig } from "./config";

export const refreshTokenExpirationInDays = 8;
export const accessTokenExpirationInMinutesWithrefreshToken = 10;

/**
 * Creates a refresh JWT Token
 *
 * @param userId the current user ID
 * @returns a string containing the encoded JWT token
 */
export function createRefreshJWTToken(
  payload: {},
  key: string,
  algorithm: JwtConfig["algorithm"] = "HS256",
): string {
  const secretOrPrivateKey = algorithm === "RS256" ? Buffer.from(key, "base64") : key;
  return jsonwebtoken.sign(payload, secretOrPrivateKey, {
    expiresIn: `${refreshTokenExpirationInDays}d`,
    algorithm,
  });
}
