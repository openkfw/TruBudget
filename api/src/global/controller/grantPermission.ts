import * as Global from "..";
import { throwIfUnauthorized } from "../../authz";
import Intent, { userAssignableIntents } from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";

export const grantGlobalPermission = async (
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const identity: string = value("identity", input.identity, isNonemptyString);
  const intent = value("intent", input.intent, x => userAssignableIntents.includes(x));

  const userIntent: Intent = "global.grantPermission";
  await throwIfUnauthorized(req.user, userIntent, await Global.getPermissions(multichain));

  await Global.grantPermission(multichain, identity, intent);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
};
