import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import * as Global from "../../global";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import * as Nodes from "../model/Nodes";
import { voteHelper } from "../voteHelper";

export async function approveNewNodeForExistingOrganization(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  // Permission check:
  const userIntent: Intent = "network.approveNewNodeForExistingOrganization";
  await throwIfUnauthorized(req.token, userIntent, await Global.getPermissions(multichain));

  // Input validation:
  const input = value("data", req.body.data, x => x !== undefined);
  const targetAddress: Nodes.WalletAddress = value("address", input.address, isNonemptyString);

  return voteHelper(multichain, req.token, targetAddress, "basic");
}
