import * as Group from ".";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import logger from "../lib/logger";
import { MultichainClient } from "../multichain/Client.h";

export const getGroupList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const groups = await Group.getAll(multichain);
  logger.debug({groups}, "List of groups received.");

  return [
    200,
    {
      apiVersion: "1.0",
      data: { groups },
    },
  ];
};
