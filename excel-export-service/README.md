# Excel-Export-Service

The excel export service is responsible for exporting multichain's data to a human readable excel file. Any user is allowed to use the excel export feature. The excel file is filled with all resources the logged in user is allowed to see.

## Getting Started

The easiest way to get started is to use our [`docker-compose`](../docker-compose) setup which starts the whole TruBudget application including the excel export project (that means you need to install [Docker](https://www.docker.com/community-edition#/download)).

```bash
cd docker-compose
cp .env.example .env
docker compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f api/docker-compose.yml -f frontend/docker-compose.yml -f excel-export-service/docker-compose.yml up
```

The cluster contains:

- 1 Alpha-Node
- 1 Alpha API connected to Alpha-Node
- 1 Frontend connected to Alpha-API
- 1 Excel-export service

### Environment Variables

To be able to activate and configure Excel Export Service, you need to set the relevant environment variables. More information on that and a list of available environment variables, see: [Environment Variables](./environment-variables.md)

### Endpoints

| Method | Endpoint   | Query Parameters | Description                                                                                                                                              |
| ------ | ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /liveness  |                  | Checks if excel service is up                                                                                                                            |
| GET    | /readiness |                  | Checks if excel service and the TruBudget API are ready                                                                                                  |
| GET    | /version   |                  | Get the current version of the service                                                                                                                   |
| GET    | /download  | lang             | Get excel file of api configured via `API_HOST` and `API_PORT` in the language specified in the query parameter (must be an existing TruBudget language) |
