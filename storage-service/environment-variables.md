# Trubudget Storage service

## Environment Variables

To ensure all necessary environment variables are set correctly this section describes all environment variables across
all services.

### Storage-Service

| Env Variable                | Default Value | Description                                                                                     |
| --------------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| STORAGE_SERVICE_HOST        | localhost     | IP address of storage service                                                                   |
| PORT                        | 8090          | The port used to expose the storage service                                                     |
| ACCESS_CONTROL_ALLOW_ORIGIN | "\*"          | CORS configuration                                                                              |
| MINIO_ACCESS_KEY            | minio         | Access key for Minio server                                                                     |
| MINIO_SECRET_KEY            | minio123      | Secret (Password) for Minio server                                                              |
| MINIO_PORT                  | 9000          | Port of connected Minio                                                                         |
| MINIO_HOST                  | localhost     | IP address of connected Minio server                                                            |
| MINIO_BUCKET_NAME           | trubudget     | Bucket name of the connected Minio server                                                       |
| AZURE_STORAGE_CONNECTION_STRING | DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://host.docker.internal:10000/devstoreaccount1;QueueEndpoint=http://host.docker.internal:10001/devstoreaccount1;   | Connection string for Azure blob storage on Azure or locally on Azurite |
| AZURE_STORAGE_PORT           | 10000     | Port on which Azurite is running. Required only with local development environment                                                       |
| AZURE_CONTAINER_NAME           | container     | Container name of the connected Azure blob storage. Container will be created if it doesn't exists                                                       |
| LOG_LEVEL                   | info          | Defines the log output. Supported levels are `trace`, `debug`, `info`, `warn`, `error`, `fatal` |

### API

| Env Variable                 | Default Value | Description                                                                                                                                                                                     |
| ---------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOCUMENT_FEATURE_ENABLED     | false         | If true, all uploaded documents are stored using trubudget's storage-service. If false, the document feature of TruBudget is disabled, and trying to upload a document will result in an error. |
| STORAGE_SERVICE_HOST         | localhost     | IP of connected storage service                                                                                                                                                                 |
| STORAGE_SERVICE_PORT         | 8090          | Port of connected storage service                                                                                                                                                               |
| STORAGE_SERVICE_EXTERNAL_URL | -             | IP and port of own connected storage service accessible externally                                                                                                                              |
