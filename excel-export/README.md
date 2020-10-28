# Excel-Export-Service

The excel export service is responsible for exporting multichain's data to a human readable excel file. Any user is allowed to use the excel export feature. The excel file is filled with all resources the logged in user is allowed to see.

## Environment Variables

### Excel-Export

| Env Variable                | Default Value | Description                                                                                                                                                                                                                                                   |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PORT                        | 8888          | The port used to expose the excel-export service.                                                                                                                                                                                                             |
| PROD_API_HOST               | localhost     | Ip address of the api production environment                                                                                                                                                                                                                  |
| PROD_API_PORT               | 8080          | Port of the api production environment                                                                                                                                                                                                                        |
| TEST_API_HOST               | localhost     | Ip address of the api test environment                                                                                                                                                                                                                        |
| TEST_API_PORT               | 8080          | Port of the api test environment                                                                                                                                                                                                                              |
| ACCESS_CONTROL_ALLOW_ORIGIN | "\*"          | Since the export service uses CORS, the domain by which it can be called needs to be set. Setting this value to `"*"` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). |

### Frontend

For details see [Frontend environment variables](../frontend/README.md#excel-export-service).

## Getting Started

The easiest way to get started is to use our pre-set [`docker-compose`](./docker-compose.yaml) cluster which starts the whole TruBudget application including the excel export project (that means you need to install [Docker](https://www.docker.com/community-edition#/download)).
The pre-set cluster contains:

- 1 Master-Node
- 1 Master API connected to Master-Node
- 1 Frontend connected to Master-API
- 1 Excel-export service

To check what is configurable regarding excel-export service check out the [environment variables section](#environment-variables)

### Endpoints

| Method | Endpoint   | Description                                                              |
| ------ | ---------- | ------------------------------------------------------------------------ |
| GET    | /health    | Checks if excel service is up                                            |
| GET    | /readiness | Checks if excel service is ready                                         |
| GET    | /version   | Get the current version of the service                                   |
| POST   | /test      | Get excel file of api configured via `TEST_API_HOST` and `TEST_API_PORT` |
| POST   | /prod      | Get excel file of api configured via `PROD_API_HOST` and `PROD_API_PORT` |
