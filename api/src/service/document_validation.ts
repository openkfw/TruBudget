import * as crypto from "crypto";
import * as Result from "../result";
import VError = require("verror");

/**
 * Returns true if the given hash matches the given document.
 *
 * @param encoded Base64 encoded document.
 * @param encodedAndHashed SHA-256 hash of the document.
 */
export async function isSameDocument(
  documentBase64: string,
  expectedSHA256: string,
): Promise<Result.Type<boolean>> {
  try {
    const hash = crypto.createHash("sha256");
    hash.update(Buffer.from(documentBase64, "base64"));
    const computedHash = hash.digest("hex");
    return computedHash === expectedSHA256;
  } catch (error) {
    return new VError(error, "compare documents failed");
  }
}
