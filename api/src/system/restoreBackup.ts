import axios from "axios";
import { VError } from "verror";

import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import logger from "../lib/logger";

export const restoreBackup = async (
  multichainHost: string,
  backupApiPort: string,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const { userId } = req.user;
  if (userId !== "root") {
    throw { kind: "AuthenticationError", userId };
  }
  const data = req.body;
  const contentType = req.headers["content-type"];
  if (contentType !== "application/gzip") {
    throw { kind: "UnsupportedMediaType", contentType };
  }
  const config = {
    headers: { "content-type": "application/gzip" },
    maxContentLength: 1074790400,
  };
  try {
    await axios.post(`http://${multichainHost}:${backupApiPort}/chain/`, data, config);
    logger.info("backup restored successfully");
  } catch (error) {
    const cause = error.response.status === 400 ? new Error(error.response.data) : error;
    throw new VError(cause, "failed to restore backup");
  }
  return [
    200,
    {
      apiVersion: "1.0",
      data: {},
    },
  ];
};
