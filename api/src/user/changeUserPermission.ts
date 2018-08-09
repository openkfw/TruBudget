import { throwIfUnauthorized } from "../authz";
import { userAssignableIntents } from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import * as User from "./model/user";

export async function changeUserPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
  userIntent: "user.intent.grantPermission" | "user.intent.revokePermission",
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const identity: string = value("identity", input.identity, isNonemptyString);
  const intent = value("intent", input.intent, x => userAssignableIntents.includes(x));

  await throwIfUnauthorized(req.token, userIntent, await User.getPermissions(multichain, identity));

  const event = {
    intent: userIntent,
    createdBy: req.token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { identity, intent },
  };

  await User.publish(multichain, identity, event);

  return [200, { apiVersion: "1.0", data: "OK" }];
}
