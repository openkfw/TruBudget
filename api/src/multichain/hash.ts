import * as crypto from "crypto";

const HEX = "hex";

export const randomString = (bytes = 16) => crypto.randomBytes(bytes).toString(HEX);
export const createHashFromData = data =>
  crypto
    .createHash("sha256")
    .update(data)
    .digest(HEX);
