import { MultichainClient } from "../service/Client.h";
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
      logger.debug(`No "send" permissions for ${addressCsv}`);
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}
