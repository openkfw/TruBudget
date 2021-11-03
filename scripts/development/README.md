# TruBudget Development Setup

This setup starts a development version of TruBudget.

## Getting started

To setup TruBudget, you need to install [Docker](https://www.docker.com/community-edition#/download) (version 20.10.7 or higher) and [Docker Compose](https://docs.docker.com/compose/install/) (version 1.29.2 or higher).

To start the slim setup (only blockchain, api, frontend), run `bash start-dev.sh` or `bash start-dev.sh --slim`.

To start 2 slim TruBudget instances for 2 organizations, run `bash start-dev.sh --slim --add-organization`.

To start the full setup, run `bash start-dev.sh --full`.

For further information, run `bash start-dev.sh --help`.

When the setup has completed, you can open these URLs in the browser:

Frontend: http://localhost:3000/

API: http://localhost:8080/api/documentation/static/index.html

### Environment Variables

The environmental variables are located in the file `.env` (in the directory `scripts/development/`). You can change them directly. If you do not have an `.env` file, you can copy the `.env_example` file.

### Options for Setup

| Options                        | Description                                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| --slim                         | Starts a TruBudget instance with master-node, master-api, provisioning and frontend.                                                               |
| --full                         | Starts a TruBudget instance with master-node, emaildb, minio, master-api, email-service, provisioning, excel-export-service, storage and frontend. |
| --enable-service [services...] | Starts additional services to the TruBudget instance. Available services: email-service, excel-export-service, storage-service                     |
| --no-log                       | Disable logs of all docker-containers                                                                                                              |
| --no-provisioning              | Skip the provisioning                                                                                                                              |
| --add-slave                    | Add a slave-node that trys to connect to master-node                                                                                               |
| --add-organization             | Add a slave-node, slave-api, slave-frontend from a new Organization. Needs to be approved by master-node                                           |
| --prune                        | Delete the multichain, document storage and email database (docker volume)                                                                         |
| --down                         | Shutdown all docker containers                                                                                                                     |
| --help                         | Print the help section                                                                                                                             |
