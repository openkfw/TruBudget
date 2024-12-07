import { HttpResponse } from "../httpd/lib";
import { MultichainClient } from "../service/Client.h";

type TimestampData = number;

const multichainTimestampData = async (
  multichainClient: MultichainClient,
): Promise<TimestampData[]> => {
  const { height } = await multichainClient.getLastBlockInfo();
  const blocks = await multichainClient.listBlocksByHeight(Math.max(0, height - 10));
  const timestamps = blocks.map((block) => block.time);
  return timestamps
};

export const getTimestamps = async (
  multichainClient: MultichainClient,
): Promise<HttpResponse> => {
  return [
    200, {
      apiVersion: "1.0",
      data: await multichainTimestampData(multichainClient),
    }
  ]
}
