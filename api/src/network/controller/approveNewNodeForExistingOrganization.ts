import { HttpResponse } from "../../httpd/lib";
import { Ctx } from "../../lib/ctx";
import logger from "../../lib/logger";
import { isNonemptyString, value } from "../../lib/validation";
import { ConnToken } from "../../service";
import { ServiceUser } from "../../service/domain/organization/service_user";
import * as Nodes from "../model/Nodes";
import { voteHelper } from "../voteHelper";

export async function approveNewNodeForExistingOrganization(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  req,
): Promise<HttpResponse> {
  const multichain = conn.multichainClient;
  const input = value("data", req.body.data, (x) => x !== undefined);
  const targetAddress: Nodes.WalletAddress = value("address", input.address, isNonemptyString);
  const publisherOrganization: string = value("publisher", req.user.organization, isNonemptyString);

  const node = await Nodes.getNode(multichain, targetAddress);

  // check if node with this address has been registered
  if (!node) {
    const message = "No node registered for this address";
    logger.error(message);
    return [409, { apiVersion: "1.0", error: { code: 409, message } }];
  }

  // check if node was already declined by this organization
  for (const decliner of node.declinedBy) {
    if (decliner.organization === publisherOrganization) {
      const message = `Node is already declined by ${publisherOrganization}`;
      logger.error(message);
      return [409, { apiVersion: "1.0", error: { code: 409, message } }];
    }
  }
  return voteHelper(conn, ctx, issuer, req.user, targetAddress, "basic");
}
