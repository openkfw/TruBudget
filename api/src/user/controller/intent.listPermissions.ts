import { throwIfUnauthorized } from "../../authz";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import * as User from "../model/user";

export async function getUserPermissions(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const input = req.query;
  // TODO(kevin): since we're dealing with identies here, the "user" could also be a
  // group, so putting the permissions stuff into the User model is kinda wrong.
  const identity = value("identity", input.identity, isNonemptyString);
  const userPermissions = await User.getPermissions(multichain, identity);
  await throwIfUnauthorized(req.token, "user.intent.listPermissions", userPermissions);
  return [200, { apiVersion: "1.0", data: userPermissions }];
}
