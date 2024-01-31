import ApplicationConfiguration from "../../helper/config";
import axios from "axios";

export const downloadFromStorageServiceWithoutDecryption = async (docId: string,secret:string): Promise<string> => {
  const url = `${ApplicationConfiguration.SOURCE_STORAGE_SERVICE_URL}/download?docId=?=${docId}`;
  const axiosConfig = {
    headers: {
      secret: secret,
    },
  };
  const downloadResponse = await axios.get(url, axiosConfig);

  if (downloadResponse.status !== 200)
    throw new Error("Error while downloading document from storage service.");

  return downloadResponse.data.data;
}


