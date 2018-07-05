import * as express from "express";
import Intent from "../../authz/intents";
import { HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import { adminPermissions } from "../model/AccessVote";
import * as Nodes from "../model/Nodes";

export async function registerNode(
  multichain: MultichainClient,
  req: express.Request,
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const address: Nodes.WalletAddress = value("address", input.address, isNonemptyString);
  const organization: string = value("organization", input.organization, isNonemptyString);

  const userIntent: Intent = "network.registerNode";

  const event = {
    intent: userIntent,
    createdBy: "<system>",
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { address, organization },
  };
  const nodes = await Nodes.get(multichain);

  const nodeExists = nodes.find(
    node => node.address.address === address && node.address.organization === organization,
  );
  if (nodeExists) {
    return [
      304,
      {
        apiVersion: "1.0",
        error: {
          code: 304,
          message: "Node already registered",
        },
      },
    ];
  } else {
    await Nodes.publish(multichain, address, event);

    // TODO: As soon as the node dashboard is ready, this should no longer be done automatically:
    console.log(`GRANTing admin permissions to ${address} (${organization})`);
    await multichain.getRpcClient().invoke("grant", address, adminPermissions.join(","));

    return [200, { apiVersion: "1.0", data: "OK" }];
  }
}
