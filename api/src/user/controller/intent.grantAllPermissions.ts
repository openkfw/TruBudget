import { userAssignableIntents } from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import logger from "../../lib/logger";
import { MultichainClient } from "../../multichain";
import { changeUserPermission } from "../changeUserPermission";

export async function grantAllUserPermissions(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  let response;
  for (const intent of userAssignableIntents) {
    logger.trace({ identity: req.body.identity, intent }, "Granting permission.");
    req.body.data.intent = intent;
    response = await changeUserPermission(multichain, req, "user.intent.grantPermission");
  }
  return response;
}
