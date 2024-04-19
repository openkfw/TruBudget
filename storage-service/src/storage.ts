import * as Minio from "minio";
import {
  deleteDocument as deleteDocumentMinio,
  downloadAsPromised,
  establishConnection as establishConnectionMinio,
  getMinioStatus,
  uploadAsPromised,
} from "./minio";
import config from "./config";
import {
  deleteDocument as deleteDocumentAzureBlob,
  download,
  establishConnection as establishConnectionAzureBlob,
  getAzureBlobStatus,
  upload,
} from "./azureblob";

export interface Metadata extends Minio.ItemBucketMetadata {
  "Content-Type"?: string;
  fileName: string;
  docId: string;
  secret?: string;
}

export interface MetadataWithName extends Metadata {
  name: string;
}

export interface FullStat {
  size: number;
  metaData: MetadataWithName;
  lastModified: Date;
  etag: string;
}

export interface FileWithMeta {
  data: string;
  meta: MetadataWithName;
}

export const sleep = (ms): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const getStorageProviderStatus = async (): Promise<{
  status: number;
  statusText: string;
}> => {
  if (config.storageProvider === "minio") {
    return await getMinioStatus();
  } else {
    return await getAzureBlobStatus();
  }
};

export const uploadDocument = async (
  file: string,
  content: string,
  metaData: Metadata = { fileName: "default", docId: "123" },
): Promise<string> => {
  if (config.storageProvider === "minio") {
    return await uploadAsPromised(file, content, metaData);
  } else {
    return await upload(file, content, metaData);
  }
};

export const downloadDocument = async (file: string): Promise<FileWithMeta> => {
  if (config.storageProvider === "minio") {
    return await downloadAsPromised(file);
  } else {
    return await download(file);
  }
};

export const deleteDocument = async (file: string): Promise<void> => {
  if (config.storageProvider === "minio") {
    return await deleteDocumentMinio(file);
  } else {
    return await deleteDocumentAzureBlob(file);
  }
};

export const establishConnection = async (): Promise<void> => {
  if (config.storageProvider === "minio") {
    return await establishConnectionMinio();
  } else {
    return await establishConnectionAzureBlob();
  }
};
