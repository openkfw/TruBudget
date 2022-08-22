# Excel-Export-Service

The excel export service is responsible for exporting multichain's data to a human readable excel file. Any user is allowed to use the excel export feature. The excel file is filled with all resources the logged in user is allowed to see.

## Environment Variables

### Excel-Export

| Env Variable                | Default Value | Description                                                                                                                                                                                                                                                   |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PORT                        | 8888          | The port used to expose the excel-export service.                                                                                                                                                                                                             |
| API_HOST                    | localhost     | IP address of the api                                                                                                                                                                                                                                         |
| API_PORT                    | 8080          | Port of the api                                                                                                                                                                                                                                               |
| ACCESS_CONTROL_ALLOW_ORIGIN | "\*"          | Since the export service uses CORS, the domain by which it can be called needs to be set. Setting this value to `"*"` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). |
| LOG_LEVEL                   | info          | Defines the log output. Supported levels are `trace`, `debug`, `info`, `warn`, `error`, `fatal`                                                                                                                                                               |
| CI_COMMIT_SHA               | ""            | Defines the CI_COMMIT_SHA property returned by the version endpoint.                                                                                                                                                                                          |
| BUILDTIMESTAMP              | ""            | Defines the BUILDTIMESTAMP property returned by the version endpoint.                                                                                                                                                                                         |

### Frontend

For details see [Frontend environment variables](../frontend/README.md#excel-export-service).

## Getting Started

The easiest way to get started is to use our pre-set [`docker-compose`](./docker-compose.yaml) cluster which starts the whole TruBudget application including the excel export project (that means you need to install [Docker](https://www.docker.com/community-edition#/download)).
The pre-set cluster contains:

- 1 Alpha-Node
- 1 Alpha API connected to Alpha-Node
- 1 Frontend connected to Alpha-API
- 1 Excel-export service

To check what is configurable regarding excel-export service check out the [environment variables section](#environment-variables)

### Endpoints

| Method | Endpoint   | Query Parameters | Description                                                                                                                                              |
| ------ | ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /liveness  |                  | Checks if excel service is up                                                                                                                            |
| GET    | /readiness |                  | Checks if excel service and the TruBudget API are ready                                                                                                  |
| GET    | /version   |                  | Get the current version of the service                                                                                                                   |
| GET    | /download  | lang             | Get excel file of api configured via `API_HOST` and `API_PORT` in the language specified in the query parameter (must be an existing TruBudget language) |
