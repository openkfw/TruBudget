import { MultichainClient } from "../service/Client.h";

import logger from "./logger";

export async function isReady(multichain: MultichainClient): Promise<boolean> {
  try {
    const rpcClient = multichain.getRpcClient();

    const addressList = await rpcClient.invoke("listaddresses");
    const addressCsv = addressList
      .filter((x) => x.ismine)
      .map((x) => x.address)
      .join(",");

    const result = await rpcClient.invoke("listpermissions", "send", addressCsv);
    if (!result.length) {
      logger.debug(`No "send" permissions for ${addressCsv}`);
      return false;
    }

    return isSynced(multichain);
  } catch (err) {
    return false;
  }
}

export async function isSynced(multichain: MultichainClient): Promise<boolean> {
  try {
    const rpcClient = multichain.getRpcClient();
    const blockchainInfo = await rpcClient.invoke("getblockchaininfo");

    // Check if the node is fully synchronized
    return blockchainInfo.verificationprogress === 1;
  } catch (err) {
    console.error("Error checking sync status:", err);
    return false;
  }
}
