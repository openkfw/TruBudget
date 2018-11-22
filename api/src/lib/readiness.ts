import { MultichainClient } from "../multichain/Client.h";
import logger from "./logger";

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
    logger.error({ error: err }, "Readiness: MultiChain connection failed");
    return false;
  }
}
