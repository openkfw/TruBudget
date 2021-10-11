import axios from "axios";

import { AuthenticatedRequest } from "../httpd/lib";

export const createBackup = async (
  multichainHost: string,
  backupApiPort: string,
  req: AuthenticatedRequest,
) => {
  const { userId } = req.user;
  if (userId === "root") {
    try {
      const response = await axios({
        url: `http://${multichainHost}:${backupApiPort}/chain-sha256`,
        responseType: "stream",
      });
      return response.data;
    } catch (err) {
      req.log.error({ err }, "bc response error");
      throw err;
    }
  } else {
    throw { kind: "AuthenticationError", userId };
  }
};
