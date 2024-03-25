import logger from "lib/logger";
import { Ctx } from "lib/ctx";
import { isNonemptyString, value } from "lib/validation";
import Intent from "../../authz/intents";
import { AddressIsInvalidError, TruBudgetError } from "../../error";
import { HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../service/Client.h";
import * as Nodes from "../model/Nodes";
import { ConnToken } from "../../service/conn";
import { ServiceUser } from "../../service/domain/organization/service_user";

export async function registerNode(multichain: MultichainClient, req): Promise<HttpResponse> {
  const input = value("data", req.body.data, (x) => x !== undefined);

  const address: Nodes.WalletAddress = value("address", input.address, isNonemptyString);

  if (!(await multichain.isValidAddress(address))) {
    throw new TruBudgetError({
      kind: "AddressIsInvalid",
      address: input.address,
    } as AddressIsInvalidError);
  }

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
    (node) => node.address.address === address && node.address.organization === organization,
  );
  if (nodeExists) {
    const message = "Node already registered";
    logger.info(message);
    return [200, { apiVersion: "1.0", data: message }];
  } else {
    await Nodes.publish(multichain, address, event);
    logger.info(`Node ${address} registered`);
    return [200, { apiVersion: "1.0", data: {} }];
  }
}

export async function registerNodeManual(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  req,
): Promise<HttpResponse> {
  const input = value("data", req.body.data, (x) => x !== undefined);

  const address: Nodes.WalletAddress = value("address", input.address, isNonemptyString);

  const multichain = conn.multichainClient;
  if (!(await multichain.isValidAddress(address))) {
    throw new TruBudgetError({
      kind: "AddressIsInvalid",
      address: input.address,
    } as AddressIsInvalidError);
  }

  const organization: string = value("organization", input.organization, isNonemptyString);

  const userIntent: Intent = "network.registerNode";

  const event = {
    intent: userIntent,
    createdBy: issuer.id,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { address, organization },
    // TODO possibly add metadata
  };
  const nodes = await Nodes.get(multichain);
  const nodeExists = nodes.find(
    (node) => node.address.address === address && node.address.organization === organization,
  );
  if (nodeExists) {
    const message = "Node already registered";
    logger.info(message);
    return [200, { apiVersion: "1.0", data: message }];
  } else {
    await Nodes.publish(multichain, address, event);
    logger.info(`Node ${address} registered`);
    return [200, { apiVersion: "1.0", data: {} }];
  }
}
