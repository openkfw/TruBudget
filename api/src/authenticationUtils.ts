import * as jsonwebtoken from "jsonwebtoken";

import { config, JwtConfig } from "./config";

export const refreshTokenExpirationInHours = config.refreshTokenExpiration;
export const accessTokenExpirationInHoursWithrefreshToken = config.accessTokenExpiration;

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
    expiresIn: `${refreshTokenExpirationInHours}h`,
    algorithm,
  });
}
