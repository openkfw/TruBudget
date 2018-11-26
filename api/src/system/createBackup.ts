<<<<<<< HEAD
import { AuthenticatedRequest } from "../httpd/lib";
import logger from "../lib/logger";
import axios from "axios";
=======
import axios from "axios";
import {
  AuthenticatedRequest,
} from "../httpd/lib";
>>>>>>> master

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
    logger.error({ error: { userId } }, "Backups can only be created with the root user");
    throw { kind: "AuthenticationError", userId };
  }
};
