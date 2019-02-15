import * as crypto from "crypto";

export const randomString = (bytes = 16) => crypto.randomBytes(bytes).toString("hex");
