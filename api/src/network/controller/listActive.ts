import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import * as Global from "../../global";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import * as AccessVote from "../model/AccessVote";
import * as Nodes from "../model/Nodes";
import { AugmentedWalletAddress, WalletAddress } from "../model/Nodes";

export async function getActiveNodes(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  // Permission check:
  const userIntent: Intent = "network.listActive";
  await throwIfUnauthorized(req.token, userIntent, await Global.getPermissions(multichain));

  // Get ALL the info:
  const numberOfConnections = await Nodes.active(multichain);
  const numberOfActiveNodes = numberOfConnections + 1;

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        peers: numberOfActiveNodes
      },
    },
  ];
}
