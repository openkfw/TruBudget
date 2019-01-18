import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import * as Global from "../../global";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain/Client.h";
import * as Nodes from "../model/Nodes";

export async function getActiveNodes(multichain: MultichainClient, req: AuthenticatedRequest): Promise<HttpResponse> {
  // Permission check:
  const userIntent: Intent = "network.listActive";
  await throwIfUnauthorized(req.user, userIntent, await Global.getPermissions(multichain));

  // Get ALL the info:
  const numberOfConnections = await Nodes.active(multichain);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        peers: numberOfConnections,
      },
    },
  ];
}
