# TruBudget Development Setup

This setup starts a development version of TruBudget.

## Getting started

To setup TruBudget, you need to install [Docker](https://www.docker.com/community-edition#/download) (version 20.10.7 or higher) and [Docker Compose](https://docs.docker.com/compose/install/) (version 1.29.2 or higher).

Set up local environment (creating .env files and installing npm packages in project folders) by running `bash scripts/initial-config.sh`. For more detailed information on how to set up development environment please refer to [developer-setup.md](../../docs/developer/developer-setup.md).

To start the slim setup (only blockchain, api, frontend), run `bash start-dev.sh` or `bash start-dev.sh --slim`.

To start 2 slim TruBudget instances for 2 organizations, run `bash start-dev.sh --slim --add-organization`.

To start the full setup, run `bash start-dev.sh --full`.

For further information, run `bash start-dev.sh --help`.

When the setup has completed, you can open these URLs in the browser:

Frontend: <http://localhost:3000/>

API: <http://localhost:8080/api/documentation/static/index.html>

> If the Trubudget has started without provisioning, only available user will be the root. The root user credentials are (by default):

```
Username  |  Password
------------------------
root      |  root-secret
```

> Default password for the root user can be changed via the environment variable ROOT_SECRET under .env file.

### Environment Variables

The environmental variables are located in the file `.env` (in the directory `scripts/development/`). You can change them directly. If you do not have an `.env` file, you can copy the `.env.example` file.

### Options for Setup

| Options                        | Description                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| --slim                         | Starts a TruBudget instance with alpha-node, alpha-api, provisioning and frontend.                                                               |
| --full                         | Starts a TruBudget instance with alpha-node, emaildb, minio (or azure-storage), alpha-api, email-service, provisioning, excel-export-service, storage and frontend. |
| --use-azure-storage            | Use Azure blob storage (locally Azurite) instead of Min.io storage for local development. |
| --no-frontend                  | Disable running frontend in docker container in order to start frontend locally. |
| --build                        | Force building.                      |
| --build-only [services...]     | Force building only mentioned services. |
| --enable-service [services...] | Starts additional services to the TruBudget instance. Available services: email-service, excel-export-service, storage-service                   |
|  --use-azure-storage           |  Use Azure blob storage (locally Azurite) instead of Min.io storage for local development |
| --no-log                       | Disable logs of all docker-containers                                                                                                            |
| --no-provisioning              | Skip the provisioning                                                                                                                            |
| --add-beta                     | Add a beta-node that trys to connect to alpha-node                                                                                               |
| --add-organization             | Add a beta-node, beta-api, beta-frontend from a new Organization. Needs to be approved by alpha-node                                             |
| --prune                        | Delete the multichain, document storage and email database (docker volume)                                                                       |
| --down                         | Shutdown all docker containers                                                                                                                   |
| --help                         | Print the help section                                                                                                                           |
