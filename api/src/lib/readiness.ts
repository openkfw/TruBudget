import axios from "axios";
import { MultichainClient } from "../multichain/Client.h";
import logger from "./logger";

const retryIntervalMs = 5000;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function isReady(multichain: MultichainClient): Promise<boolean> {
  try {
    const rpcClient = multichain.getRpcClient();

    const addressList = await rpcClient.invoke("listaddresses");
    const addressCsv = addressList
      .filter(x => x.ismine)
      .map(x => x.address)
      .join(",");

    const result = await rpcClient.invoke("listpermissions", "send", addressCsv);
    if (!result.length) {
      logger.warn(`No "send" permissions for ${addressCsv}`);
      return false;
    }

    return true;
  } catch (err) {
    logger.warn(err, "readiness: MultiChain connection failed");
    return false;
  }
}

export async function waitUntilReady(multichain: MultichainClient): Promise<void> {
  while (!(await isReady(multichain))) {
    logger.info(`API not ready yet - retry in ${retryIntervalMs} ms.`);
    await timeout(retryIntervalMs);
  }
}
