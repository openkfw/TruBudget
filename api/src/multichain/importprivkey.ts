import { MultichainClient } from "./Client.h";

export function importprivkey(
  multichain: MultichainClient,
  privkey: string,
  userId: string,
): Promise<void> {
  const label = userId;
  const doRescan = false;
  return multichain.getRpcClient().invoke("importprivkey", privkey, label, doRescan);
}
