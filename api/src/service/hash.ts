import * as crypto from "crypto";

export const randomString = (bytes = 16): string => crypto.randomBytes(bytes).toString("hex");
