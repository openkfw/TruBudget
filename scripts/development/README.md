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

The environmental variables are located in the file `.env_example_slim` and `.env_example_slim`. The variables are copied by the `start-dev.sh` to `.env` each time.

### Options for Setup

| Options            | Description                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| --slim             | Starts a TruBudget instance with master-node, master-api, provisioning and frontend.                                                               |
| --full             | Starts a TruBudget instance with master-node, emaildb, minio, master-api, email-service, provisioning, excel-export-service, storage and frontend. |
| --add-slave        | Add a slave-node that trys to connect to master-node                                                                                               |
| --add-organization | Add a slave-node, slave-api, slave-frontend from a new Organization. Needs to be approved by master-node                                           |
| --build            | Force docker-compose build                                                                                                                         |
| --no-provisioning  | Do not start the provisioning                                                                                                                      |
| --help             | Print the help section                                                                                                                             |
