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
  streamName: string,
): Promise<Object> {
  const streams: Stream[] = await rpcClient.listStreams();
  const amountOfStreamsWithThisName = streams.filter(
    (s) => s.name === streamName,
  ).length;
  if (amountOfStreamsWithThisName === 0) {
    console.log("error 1");
    throw new Error();
  }
  if (amountOfStreamsWithThisName > 1) {
    console.log("error 2");
    throw new Error();
  }
  const stream: Stream | undefined = streams.find((s) => s.name === streamName);

  return {
    numberOfTx: stream?.items ?? 0,
  };
}

export default {};
