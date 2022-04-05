import { MultichainInformation } from "domain/multichainInformation";
import { Stream } from "domain/stream";
import { StreamItem } from "domain/streamItem";
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
export async function getAllStreamItems(
  rpcClient: MultichainClient,
  streamName: string,
): Promise<StreamItem[]> {
  let streamItems: StreamItem[];
  try {
    streamItems = await rpcClient.listStreamItems(streamName);
  } catch (error) {
    throw new Error("No StreamItems found");
  }

  return streamItems;
}

export async function getTxDetails(
  rpcClient: MultichainClient,
  streamName: string,
  txid: string,
): Promise<StreamItem> {
  const tx = await rpcClient.getStreamItem(streamName, txid);
  return tx;
}

export async function getNumberOfTx(
  rpcClient: MultichainClient,
  streamName: string,
): Promise<Object> {
  const streams: Stream[] = await rpcClient.listStreams();

  const stream: Stream | undefined = streams.find((s) => s.name === streamName);

  if (stream === undefined) {
    throw new Error("No streams found");
  }
  return {
    numberOfTx: stream.items,
  };
}

export default {};
