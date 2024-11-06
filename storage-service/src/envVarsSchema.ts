import * as Joi from "joi";

export const envVarsSchema = Joi.object({
  STORAGE_SERVICE_PORT: Joi.number()
    .port()
    .default(8090)
    .note("The port used to expose the storage service."),
  ACCESS_CONTROL_ALLOW_ORIGIN: Joi.string()
    .empty("")
    .default("*")
    .note("CORS configuration. Defaults to allow all origins."),
  RATE_LIMIT: Joi.number()
    .empty("")
    .note(
      "Defines the limit each IP to RATE_LIMIT requests per windowMs (1 minute).",
    ),
  STORAGE_PROVIDER: Joi.string()
    .empty("")
    .allow("azure-storage", "minio")
    .default("minio")
    .note(
      " Set to `azure-storage` if you use Azure Storage Account, otherwise defaults to `minio`.",
    ),
  MINIO_ACCESS_KEY: Joi.string()
    .default("minio")
    .empty("")
    .note("Access key for Minio server."),
  MINIO_SECRET_KEY: Joi.string()
    .default("minio123")
    .empty("")
    .note("Secret (Password) for Minio server."),
  MINIO_HOST: Joi.string()
    .default("localhost")
    .empty("")
    .note("Host/IP address of connected Minio server."),
  MINIO_PORT: Joi.number()
    .port()
    .empty("")
    .default(9000)
    .note("Port of connected Minio server"),
  MINIO_PROTOCOL: Joi.string()
    .empty("")
    .allow("http", "https")
    .default("http")
    .note("Protocol of connected Minio server. `http` or `https`."),
  MINIO_BUCKET_NAME: Joi.string()
    .empty("")
    .default("trubudget")
    .note("Bucket name of the connected Minio server"),
  MINIO_REGION: Joi.string()
    .default("us-east-1")
    .empty("")
    .note(
      "Region where the bucket is created. This parameter is optional. Default value is us-east-1.",
    ),
  AZURE_STORAGE_CONNECTION_STRING: Joi.string()
    .default(
      "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://host.docker.internal:10000/devstoreaccount1;QueueEndpoint=http://host.docker.internal:10001/devstoreaccount1;",
    )
    .note(
      "Connection string for Azure blob storage on Azure or locally on Azurite.",
    ),
  AZURE_STORAGE_PORT: Joi.number()
    .port()
    .empty("")
    .default(10000)
    .note(
      "Port on which Azurite is running. Required only with local development environment.",
    ),
  AZURE_ACCOUNT_NAME: Joi.string().default(""),
  AZURE_CONTAINER_NAME: Joi.string()
    .empty("")
    .default("container")
    .note(
      "Container name of the connected Azure blob storage. Container will be created if it doesn't exists.",
    ),
  SILENCE_LOGGING_ON_FREQUENT_ROUTES: Joi.boolean().empty("").default(false),
  SHORT_ROUTES_LOGGING_OUTPUT: Joi.boolean().default(false).empty(""),
  LOG_LEVEL: Joi.string()
    .allow("trace", "debug", "info", "warn", "error", "fatal")
    .default("info")
    .note(
      "Defines the log output. Supported levels are `trace`, `debug`, `info`, `warn`, `error`, `fatal`.",
    ),
})
  .unknown()
  .required();
