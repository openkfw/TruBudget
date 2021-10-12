# TruBudget Operation Setup

This setup helps operation teams to setup TruBudget in an easy way with a pre-configured `.env` file.

## Getting started

To setup TruBudget, you need to install [Docker](https://www.docker.com/community-edition#/download) (version 20.10.7 or higher) and [Docker Compose](https://docs.docker.com/compose/install/) (version 1.29.2 or higher).

First, to make sure the `.env` file is set, run `cp env_example .env`

To start the slim setup (only blockchain, api, frontend), run `bash start-trubudget.sh` or `bash start-trubudget.sh --slim`.

To start 2 slim TruBudget instances for 2 organizations, run `bash start-dev.sh --slim --add-organization`.

To start the full setup, run `bash start-trubudget.sh --full`.

For further information, run `bash start-trubudget.sh --help`.

When the setup has completed, you can open these URLs in the browser:

Frontend: http://localhost:3000/

API: http://localhost:8080/api/documentation/static/index.html

### Setup with two organizations

To learn how to setup TruBudget with multiple organizations and how tho connect them, see the documentation of [Connect to an existing network](../../docs/operation-administration/installation/create-new-network/create-new-docker-compose.md#connect-to-an-existing-blockchain-network)

### Environment Variables

The environmental variables are located in the file `.env` (in the directory `scripts/operation/`). You can change them directly.

### Options for Setup

| Options                        | Description                                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| --slim                         | Starts a TruBudget instance with master-node, master-api, provisioning and frontend.                                                               |
| --full                         | Starts a TruBudget instance with master-node, emaildb, minio, master-api, email-service, provisioning, excel-export-service, storage and frontend. |
| --enable-service [services...] | Starts additional services to the TruBudget instance. Available services: email-service, excel-export-service, storage-service                     |
| --no-log                       | Disable logs of all docker-containers                                                                                                              |
| --provision                    | Start the provisioning                                                                                                                             |
| --add-slave                    | Add a slave-node that trys to connect to master-node                                                                                               |
| --add-organization             | Add a slave-node, slave-api, slave-frontend from a new Organization. Needs to be approved by master-node                                           |
| --prune                        | Delete the multichain, document storage and email database (docker volume)                                                                         |
| --help                         | Print the help section                                                                                                                             |
