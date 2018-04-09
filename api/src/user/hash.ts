import * as crypto from "crypto";

const SALT_PASSWORD = "8VarIJ1Mlr";
const ITERATIONS = 10;
const KEY_LENGTH = 10;
const DIGEST = "sha512";
const HEX = "hex";

export const createPasswordHash = (password: string): Promise<string> =>
  new Promise((res, rej) => {
    crypto.pbkdf2(password, SALT_PASSWORD, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) rej(err);
      res(derivedKey.toString(HEX));
    });
  });
