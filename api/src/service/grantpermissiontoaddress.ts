import logger from "../lib/logger";

import { MultichainClient } from "./Client.h";

export function grantpermissiontoaddress(
  multichain: MultichainClient,
  address: string,
  permissions: string[],
): Promise<void> {
  logger.debug({ address, permissions }, "Granting multichain permissions to address");
  return multichain.getRpcClient().invoke("grant", address, permissions.join(","));
}
