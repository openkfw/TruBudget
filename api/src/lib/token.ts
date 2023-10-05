import { Jwt, verify } from "njwt";

export const verifyToken = (token: string, signingKey: string | Buffer): Jwt | undefined => {
  const verifiedJwt = verify(token, signingKey);
  return verifiedJwt;
};
