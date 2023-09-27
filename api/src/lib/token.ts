import { Jwt, verify } from "njwt";
import { JWK, JWE } from "node-jose";

export const verifyToken = (token: string, signingKey: string | Buffer): Jwt | undefined => {
  try {
    const verifiedJwt = verify(token, signingKey);
    return verifiedJwt;
  } catch (e) {
    // TODO add proper TB handling (find out what that is glhf)
    console.log(e);
  }
};

export const decryptToken = async (token, keystore): Promise<string> => {
  return JWE.createDecrypt(keystore)
    .decrypt(token)
    .then(function (result) {
      return result.plaintext.toString();
    });
};

export const getKeyStore = async (keys: string | object): Promise<JWK.KeyStore> => {
  return await JWK.asKeyStore(keys);
};
