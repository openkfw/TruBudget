import axios from "axios";

import { AuthenticatedRequest } from "../httpd/lib";

export const createBackup = async (
  multichainHost: string,
  backupApiPort: string,
  req: AuthenticatedRequest,
) => {
  const { userId } = req.user;
  if (userId === "root") {
    const response = await axios({
      url: `http://${multichainHost}:${backupApiPort}/chain`,
      responseType: "stream",
    });
    return response.data;
  } else {
    throw { kind: "AuthenticationError", userId };
  }
};
