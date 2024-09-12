import { config } from "../config";
import { HttpResponse } from "../httpd/lib";
import { MultichainClient } from "../service/Client.h";
import StorageServiceClient from "../service/Client_storage_service";
import { Version } from "../service/Client_storage_service.h";

import BlockchainApi from "./blockchainApi";

interface VersionMetadata {
  release?: string;
  ping?: number;
  commit?: string;
  buildTimeStamp?: string;
}

const blockchainApi = new BlockchainApi();

const bcVersionMetaData = async (blockchainProtocol: "http" | "https", blockchainHost: string, blockchainPort: number): Promise<VersionMetadata> => {
  blockchainApi.setBaseUrl(`${blockchainProtocol}://${blockchainHost}:${blockchainPort}`);
  const { data } = await blockchainApi.fetchVersion();
  return data;
};

const apiVersionMetaData = (): VersionMetadata => {
  const metaData: VersionMetadata = {
    release: config.npmPackageVersion,
    commit: config.ciCommitSha,
    buildTimeStamp: config.buildTimeStamp,
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

const storageServiceMetaData = async (
  storageServiceClient: StorageServiceClient,
): Promise<Version> => storageServiceClient.getVersion();

export const getVersion = async (
  blockchainProtocol: "http" | "https",
  blockchainHost: string,
  blockchainPort: number,
  multichainClient: MultichainClient,
  storageServiceClient: StorageServiceClient,
): Promise<HttpResponse> => {
  // TODO (future): If any of axios requests fails, the whole getVersion request fails
  // TODO (future): Resolve promises PromiseAllSettled and handle errors
  if (config.documentFeatureEnabled) {
    return [
      200,
      {
        apiVersion: "1.0",
        data: {
          api: apiVersionMetaData(),
          blockchain: await bcVersionMetaData(blockchainProtocol, blockchainHost, blockchainPort),
          multichain: await multichainVersionMetaData(multichainClient),
          storage: await storageServiceMetaData(storageServiceClient),
        },
      },
    ];
  }
  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        api: apiVersionMetaData(),
        blockchain: await bcVersionMetaData(blockchainProtocol, blockchainHost, blockchainPort),
        multichain: await multichainVersionMetaData(multichainClient),
      },
    },
  ];
};
