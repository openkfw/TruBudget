import axios from "axios";
import { HttpResponse } from "../httpd/lib";
import { MultichainClient } from "../service/Client.h";

const bcVersionMetaData = async (multichainHost, backupApiPort) => {
  const { data } = await axios.get(`http://${multichainHost}:${backupApiPort}/version`);
  return data;
};

const apiVersionMetaData = () => {
  const metaData =  {
    release: process.env.npm_package_version,
    commit: process.env.CI_COMMIT_SHA || "",
    buildTimeStamp: process.env.BUILDTIMESTAMP || "",
  };
  return metaData;
};

const getMultichainVersion = async (multichainClient: MultichainClient): Promise<string> => {
  const { version } = await multichainClient.getInfo();
  return version;
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
        multichain: {release: await getMultichainVersion(multichainClient)},
      },
    },
  ];
};
