import Intent from "../../authz/intents";
import {
  AddressIsInvalidError,
  NotFoundError,
  PreconditionError,
  TruBudgetError,
} from "../../error";
import { HttpResponse } from "../../httpd/lib";
import logger from "../../lib/logger";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../service/Client.h";
import * as Nodes from "../model/Nodes";

export async function declineNode(multichain: MultichainClient, req): Promise<HttpResponse> {
  const input = value("data", req.body.data.node, (x) => x !== undefined);

  const address: Nodes.WalletAddress = value("address", input.address, isNonemptyString);
  if (!(await multichain.isValidAddress(address))) {
    throw new TruBudgetError({
      kind: "AddressIsInvalid",
      address: input.address,
    } as AddressIsInvalidError);
  }

  const organization: string = value("organization", input.organization, isNonemptyString);
  const declinerOrganization: string = value("decliner", req.user.organization, isNonemptyString);
  const declinerAddress: string = value("decliner", req.user.address, isNonemptyString);

  const userIntent: Intent = "network.declineNode";

  const event = {
    intent: userIntent,
    createdBy: "<system>",
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { address: address, organization, declinerAddress, declinerOrganization },
  };

  //check if node with this address and organization has been registered
  const node = await Nodes.getNode(multichain, address, organization);
  if (!node) {
    const message = `No node registered for organization '${organization}'`;
    throw new TruBudgetError({ kind: "NotFound", what: { message: message } } as NotFoundError);
  }

  //check if node was already declined by this organization
  for (const decliner of node.declinedBy) {
    if (decliner.organization === declinerOrganization) {
      const message = `Node is already declined by ${declinerOrganization}`;
      throw new TruBudgetError({
        kind: "PreconditionError",
        message: message,
      } as PreconditionError);
    }
  }

  //check if node was already approved by this organization
  for (const permission of node.networkPermissions) {
    if (permission.permission === "connect") {
      const message = "Node is already approved";
      throw new TruBudgetError({
        kind: "PreconditionError",
        message: message,
      } as PreconditionError);
    }
  }
  // publish new 'declineNode' event on the nodes stream
  await Nodes.publish(multichain, address, event);
  logger.info(`Node ${address} declined`);
  return [200, { apiVersion: "1.0", data: { message: `Node ${address} declined` } }];
}
