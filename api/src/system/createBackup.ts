import axios, { AxiosResponse } from "axios";
import { TruBudgetError } from "../error";
import { AuthenticatedRequest } from "../httpd/lib";

export const createBackup = async (
  blockchainHost: string,
  blockchainPort: number,
  req: AuthenticatedRequest,
): Promise<AxiosResponse> => {
  const { userId } = req.user;
  if (userId === "root") {
    try {
      const response = await axios({
        url: `http://${blockchainHost}:${blockchainPort}/chain-sha256`,
        responseType: "stream",
      });
      return response.data;
    } catch (err) {
      req.log.error({ err }, "bc response error");
      throw err;
    }
  } else {
    throw new TruBudgetError({ kind: "AuthenticationError", userId });
  }
};
