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
  txid: string,
): Promise<StreamItem> {
  return rpcClient.getRawTransaction(rpcClient, txid);
}

export async function getNumberOfTx(
  rpcClient: MultichainClient,
  streamName: string,
): Promise<Object> {
  const streams: Stream[] = await rpcClient.listStreams();
  // const amountOfStreamsWithThisName = streams.filter(
  //   (s) => s.name === streamName,
  // ).length;

  // if (amountOfStreamsWithThisName === 0) {
  //   console.log("error 1");
  //   throw new Error("No streams found");
  // }
  // if (amountOfStreamsWithThisName > 1) {
  //   console.log("error 2");
  //   throw new Error("More than one stream found with this name");
  // }

  const stream: Stream | undefined = streams.find((s) => s.name === streamName);

  if (stream === undefined) {
    throw new Error("No streams found");
  }
  return {
    numberOfTx: stream.items,
  };
}

export default {};
