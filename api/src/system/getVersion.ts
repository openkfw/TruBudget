import { HttpResponse } from "../httpd/lib";
import { MultichainClient } from "../service/Client.h";
import BlockchainApi from "./blockchainApi";

interface VersionMetadata {
  release?: string;
  ping?: number;
  commit?: string;
  buildTimeStamp?: string;
}

const blockchainApi = new BlockchainApi();

const bcVersionMetaData = async (multichainHost, backupApiPort): Promise<VersionMetadata> => {
  blockchainApi.setBaseUrl(`http://${multichainHost}:${backupApiPort}`);
  const { data } = await blockchainApi.fetchVersion();
  return data;
};

const apiVersionMetaData = () => {
  console.log(process.env.npm_package_version);
  const metaData: VersionMetadata = {
    release: process.env.npm_package_version,
    commit: process.env.CI_COMMIT_SHA || "",
    buildTimeStamp: process.env.BUILDTIMESTAMP || "",
  };
  return metaData;
};

const multichainVersionMetaData = async (
  multichainClient: MultichainClient,
): Promise<VersionMetadata> => {
  const { version, ping } = await multichainClient.getInfo();
  return {
    release: version,
    ping,
  };
};

export const getVersion = async (
  multichainHost: string,
  backupApiPort: string,
  multichainClient: MultichainClient,
): Promise<HttpResponse> => {
  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        api: apiVersionMetaData(),
        blockchain: await bcVersionMetaData(multichainHost, backupApiPort),
        multichain: await multichainVersionMetaData(multichainClient),
      },
    },
  ];
};
