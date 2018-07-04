import { MultichainClient } from ".";

export function importprivkey(multichain: MultichainClient, privkey: string): Promise<void> {
  return multichain.getRpcClient().invoke("importprivkey", privkey);
}
