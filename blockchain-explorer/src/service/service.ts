import { MultichainInformation } from "domain/multichainInformation";
import { Stream } from "domain/stream";
import { MultichainClient } from "infrastructure/RpcClient";

export async function getInformation(
  rpcClient: MultichainClient,
): Promise<MultichainInformation> {
  return rpcClient.getInfo();
}

export async function getStreams(
  rpcClient: MultichainClient,
): Promise<Stream[]> {
  return rpcClient.listStreams();
}
export async function getNumberOfTx(
  rpcClient: MultichainClient,
  streamId: string,
): Promise<number> {
  return rpcClient.getStreamItemsLength(streamId);
}

export default {};
