import { MultichainInformation } from "domain/multichainInformation";

export async function getInformation(
  rpcClient: any,
): Promise<MultichainInformation> {
  return rpcClient.getInfo();
}
