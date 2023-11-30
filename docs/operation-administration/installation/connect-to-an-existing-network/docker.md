# Connect to an existing Blockchain network using docker

This guide describes how to connect to an existing network using of Docker and Docker Compose.
Before starting make sure to have docker and docker compose available on your machine.

## Table of Contents

## Trubudget Docker Images

Trubudget's docker images are published on [docker-hub](https://hub.docker.com/u/trubudget).
It is recommended to use a specific version tag like v.1.20.0 instead of the main or latest tag.

>Only use main or latest tag if a code change of these versions is needed.

## Blockchain

A `beta node` is a Trubudget node which connects to an existing Trubudget network.
To understand the connection process read the [approval process documentation](./connection-process.md).

### Environment Variables

To establish a connection to an existing Trubudget network following conditions must be met:

1. For a description of all Environment variables, see [environment variables](../../../environment-variables.md).
   This table gives an overview how to set the env vars correctly, so the beta node can connect to the alpha node.
   Empty entries mean that setting that env var has no effect.

| Env Var Name | Description | Alpha API  | Alpha Blockchain | Beta API | Beta Blockchain  |
| --- | --- | --- | --- | --- | --- |
| EXTERNAL_IP  |   Public IP-address and Port of the alpha blockchain    |        Not relevant         |       Leave empty         | Not relevant | Leave empty if the alpha and beta are in the same network. |
| P2P_HOST       | Private IP-address of the alpha blockchain for P2P communication        |         Leave Empty                   | Leave empty                                                                      | Leave empty  | Must be set |
| P2P_PORT         | Port used for P2P communications by nodes         |         Not Relevant         | Must be set first in alpha to be used by beta blockchain                         |    Not relevant                                         | Must be set as the value set by the alpha blockchain  |
| API_HOST            | IP-address of the alpha API      |  Not relevant                          | Not relevant                              |                                Not relevant             | Must be set so that network registration requests could be sent                    |
| API_PORT        | Port of the alpha api          |             Must be set                                     | Not relevant                                                      |                              Not relevant                                                | Must be set for network registration               |              
| PORT          | Port for corresponding service            | Must be set                           | Must be set                                                                                | Must be set                    | Must be set                                     |
| MULTICHAIN_RPC_HOST  | IP-address used in RPC comms between api and blockchain      | Must be set              | Not relevant                                                                                   | Must be set    | Not relevant           |
| MULTICHAIN_RPC_PORT   | Port used in RPC comms between api and blockchain    | Must be set same port as in alpha node      | Must be set for alpha node                                                                                          | Must be set same port as in beta node      | Must be set for beta node       |         
| MULTICHAIN_RPC_PASSWORD   | Password used in RPC comms between api and blockchain | Must be set same password as in alpha node    | Must be set for alpha node                             | Must be set same password as in beta node         | Must be set for beta node (different password than alpha)    |
| ORGANIZATION      | Organization name of alpha/beta nodes        | Must be set as alpha node organization              | Must be set as alpha node organization                                                    | Must be set as beta node organization (different than alpha node organization)             | Must be set as alpha node organization (different than alpha node organization) |
| ORGANIZATION_VAULT_SECRET | Organization vault secrets of alpha/beta nodes | Must be set as alpha node organization | Must be set as alpha node organization                                                                      | Must be set as beta node organization (different than alpha node organization) | Must be set as beta node organization (different than alpha node organization)    

### Example setup
You can see an example multi-node setup via docker-compose under `/docker-compose/multi-node`. Check out the container env variable setup in `docker-compose.yml` to have a better idea how they are used differently in alpha and beta services.