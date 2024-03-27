import { Jwt, verify } from "njwt";

export const verifyToken = (
  token: string,
  signingKey: string | Buffer,
  algorithm?: string,
): Jwt | undefined => {
  const verifiedJwt = verify(token, signingKey, algorithm);
  return verifiedJwt;
};
