import { MultichainClient } from "./Client.h";

export function grantpermissiontoaddress(
  multichain: MultichainClient,
  address: string,
  permissions: string[],
): Promise<void> {
  return multichain.getRpcClient().invoke("grant", address, permissions.join(","));
}
