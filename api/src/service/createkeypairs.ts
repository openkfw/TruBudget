import { MultichainClient } from "./Client.h";
import { KeyPair } from "./domain/organization/key_pair";

export async function createkeypairs(multichain: MultichainClient): Promise<KeyPair> {
  const keyInfo: KeyPair = await multichain
    .getRpcClient()
    .invoke("createkeypairs")
    .then((result: KeyPair[]) => result[0]);

  return keyInfo;
}
