import { HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../service/Client.h";
import * as Nodes from "../model/Nodes";
import { voteHelper } from "../voteHelper";

export async function approveNewNodeForExistingOrganization(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);
  const targetAddress: Nodes.WalletAddress = value("address", input.address, isNonemptyString);

  return voteHelper(multichain, req.user, targetAddress, "basic");
}
