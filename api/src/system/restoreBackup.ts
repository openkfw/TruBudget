import axios from "axios";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import logger from "../lib/logger";

export const restoreBackup = async (
  multichainHost: string,
  backupApiPort: string,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const { userId } = req.user;
  if (userId === "root") {
    const data = req.body;
    const contentType = req.headers["content-type"];
    if (contentType !== "application/gzip") {
      throw { kind: "UnsupportedMediaType",  contentType};
    }
    const config = {
      headers: { "content-type": "application/gzip" },
      maxContentLength: 1074790400,
    };
    try {
      await axios.post(`http://${multichainHost}:${backupApiPort}/chain/`, data, config);
    } catch (err) {
      if (err.response.status === 400) {
        logger.error({ error: err }, "File corrupt");
        throw { kind: "CorruptFileError" };
      } else {
        logger.error({ error: err }, "An error occured while restoring the backup");
        throw new Error(err.message);
      }
    }
    return [
      200,
      {
        apiVersion: "1.0",
        data: "OK",
      },
    ];
  } else {
    logger.error({ error: { userId } }, "An error occured while restoring backup");
    throw { kind: "AuthenticationError", userId };
  }
};
