import axios from "axios";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";

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
        throw { kind: "CorruptFileError" };
      } else {
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
    throw { kind: "AuthenticationError", userId };
  }
};
