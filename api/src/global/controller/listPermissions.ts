import * as Global from "..";
import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";

export const getGlobalPermissions = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const permissions = await Global.getPermissions(multichain);

  const userIntent: Intent = "global.listPermissions";
  await throwIfUnauthorized(req.token, userIntent, permissions);

  return [
    200,
    {
      apiVersion: "1.0",
      data: permissions,
    },
  ];
};
