import * as Global from "..";
import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import logger from "../../lib/logger";
import { MultichainClient } from "../../multichain/Client.h";

export const getGlobalPermissions = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const permissions = await Global.getPermissions(multichain);

  const userIntent: Intent = "global.listPermissions";
  await throwIfUnauthorized(req.user, userIntent, permissions);
  logger.debug({ permissions }, "Getting permissions.");
  return [
    200,
    {
      apiVersion: "1.0",
      data: permissions,
    },
  ];
};
