import { envVarsSchema } from "./envVarsSchema";
interface MinioConfig {
  accessKey: string;
  secretKey: string;
  host: string;
  port: number;
  protocol: "http" | "https";
  bucketName: string;
  region: string;
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
  silenceLoggingOnFrequentRoutes: boolean;
  shortRoutesLogging: boolean;
}

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config: Config = {
  port: envVars.STORAGE_SERVICE_PORT,
  allowOrigin: envVars.ACCESS_CONTROL_ALLOW_ORIGIN,
  rateLimit: envVars.RATE_LIMIT,
  storageProvider: envVars.STORAGE_PROVIDER,
  storage: {
    accessKey: envVars.MINIO_ACCESS_KEY,
    secretKey: envVars.MINIO_SECRET_KEY,
    host: envVars.MINIO_HOST,
    port: envVars.MINIO_PORT,
    protocol: envVars.MINIO_PROTOCOL,
    bucketName: envVars.MINIO_BUCKET_NAME,
    region: envVars.MINIO_REGION,
  },
  azureBlobStorage: {
    azureConnectionString: envVars.AZURE_STORAGE_CONNECTION_STRING,
    azureStorageUrl:
      envVars.AZURE_STORAGE_URL && envVars.AZURE_STORAGE_URL !== ""
        ? envVars.AZURE_STORAGE_URL
        : `https://${envVars.AZURE_ACCOUNT_NAME}.blob.core.windows.net`,
    containerName: envVars.AZURE_CONTAINER_NAME,
  },
  silenceLoggingOnFrequentRoutes: envVars.SILENCE_LOGGING_ON_FREQUENT_ROUTES,
  shortRoutesLogging: envVars.SHORT_ROUTES_LOGGING_OUTPUT,
};

export default config;
