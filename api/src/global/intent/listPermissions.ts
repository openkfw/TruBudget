import * as Global from "..";
import { throwIfUnauthorized } from "../../authz";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib";
import { MultichainClient } from "../../multichain";

export const getGlobalPermissions = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const permissions = await Global.getPermissions(multichain);

  // Is the user allowed to list global permissions?
  await throwIfUnauthorized(req.token, "global.intent.listPermissions", permissions);

  return [
    200,
    {
      apiVersion: "1.0",
      data: permissions
    }
  ];
};
