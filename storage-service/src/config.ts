interface MinioConfig {
  accessKey: string;
  secretKey: string;
  host: string;
  port: number;
  bucketName: string;
}
interface AzureBlobConfig {
  azureStorageUrl: string;
  azureConnectionString: string | undefined;
  containerName: string;
}
interface Config {
  port: number;
  allowOrigin: string;
  storageProvider: string;
  rateLimit: number | undefined;
  storage: MinioConfig;
  azureBlobStorage: AzureBlobConfig;
}

const config: Config = {
  port: Number(process.env.STORAGE_SERVICE_PORT) || 8090,
  allowOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
  rateLimit:
    process.env.RATE_LIMIT === "" || isNaN(Number(process.env.RATE_LIMIT))
      ? undefined
      : Number(process.env.RATE_LIMIT),
  storageProvider:
    process.env.STORAGE_PROVIDER === "azure-storage"
      ? "azure-storage"
      : "minio",
  storage: {
    accessKey: process.env.MINIO_ACCESS_KEY || "minio",
    secretKey: process.env.MINIO_SECRET_KEY || "minio123",
    host: process.env.MINIO_HOST || "localhost",
    port: Number(process.env.MINIO_PORT) || 9000,
    bucketName: process.env.MINIO_BUCKET_NAME || "trubudget",
  },
  azureBlobStorage: {
    azureConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    azureStorageUrl:
      process.env.AZURE_STORAGE_URL && process.env.AZURE_STORAGE_URL !== ""
        ? process.env.AZURE_STORAGE_URL
        : `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net`,
    containerName: process.env.AZURE_CONTAINER_NAME || "container",
  },
};

export default config;
