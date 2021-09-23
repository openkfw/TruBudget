import { MultichainClient } from "./Client.h";

export async function getselfaddress(multichain: MultichainClient): Promise<string> {
  const addressList = await multichain.getRpcClient().invoke("listaddresses", "*", false, 1, 0);
  const [myAddress] = addressList.filter((a) => a.ismine).map((o) => o.address);
  return myAddress;
}
