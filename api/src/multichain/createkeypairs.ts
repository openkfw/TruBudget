import { MultichainClient } from ".";

export interface KeyPair {
  address: string;
  pubkey: string;
  privkey: string;
}

export async function createkeypairs(multichain: MultichainClient): Promise<KeyPair> {
  const keyInfo: KeyPair = await multichain
    .getRpcClient()
    .invoke("createkeypairs")
    .then((result: KeyPair[]) => result[0]);

  return keyInfo;
}
