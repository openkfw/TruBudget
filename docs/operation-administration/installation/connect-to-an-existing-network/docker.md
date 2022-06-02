# Connect to an existing Blockchain network using docker

This guide describes how to connect to an existing network using of Docker and Docker-Compose.
Before starting make sure to have docker and docker-compose available on your machine.

## Table of Contents

## Trubudget Docker Images

Trubudget's docker images are published on [dockerhub](https://hub.docker.com/u/trubudget).
It is recommended to use a specific version tag like v.1.20.0 instead of the main or latest tag.

:::hint
Only use main or latest tag if a code change of these versions is needed.
:::

## Blockchain

A `beta node` is a Trubudget node which connects to an existing Trubudget network.
To understand the connection process read the [approval process documentation](./connection-process.md).

### Environment Variables

To establish a connection to an existing Trubudget network following conditions must be met:

1.  For a description of all Environment variables, see [environment variables](../../../environment-variables.md).
    This table gives an overview how to set the env vars correctly, so the slave node can connect to the master node. Empty entries mean that setting that env var has no effect.

| Name of env var           | Master API                                    | Master Blockchain                                        | Slave API                                    | Slave Blockchain                                                                                                          |
| ------------------------- | --------------------------------------------- | -------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| EXTERNAL_IP               |                                               | _must not set_                                           |                                              | public IP-address and Port of the master Blockchain (optional, not necessary if master and slave are in the same network) |
| P2P_HOST                  |                                               | _must not set_                                           |                                              | private IP-address of the master Blockchain                                                                               |
| P2P_PORT                  |                                               | set a port                                               |                                              | P2P_PORT of the master Blockchain                                                                                         |
| <br>                      | <br>                                          | <br>                                                     | <br>                                         | <br>                                                                                                                      |
| API_HOST                  |                                               | IP-address of master API                                 |                                              | IP-address of the Slave API                                                                                               |
| API_PORT                  |                                               | PORT of master API                                       |                                              | PORT of the Slave API                                                                                                     |
| <br>                      | <br>                                          | <br>                                                     | <br>                                         | <br>                                                                                                                      |
| PORT                      | set a port                                    | set a port                                               | set a port                                   | set a port                                                                                                                |
| <br>                      | <br>                                          | <br>                                                     | <br>                                         | <br>                                                                                                                      |
| RPC_HOST                  | IP-address of master blockchain               | set a port                                               | set a port                                   | set a port                                                                                                                |
| RPC_PORT                  | RPC_PORT of master blockchain                 | set a port                                               | RPC_PORT of slave blockchain                 | set a port                                                                                                                |
| RPC_PASSWORD              | same password as in master blockchain         | set a password                                           | same password as in slave blockchain         | set a password                                                                                                            |
| <br>                      | <br>                                          | <br>                                                     | <br>                                         | <br>                                                                                                                      |
| ORGANIZATION              | organization name of master node              | organization name of master node (same as in master API) | organization name of slave node              | organization name of slave node (same as in slave API)                                                                    |
| ORGANIZATION_VAULT_SECRET | organization vault secret of your master node | organization vault secret (same as in master API)        | organization vault secret of your slave node | organization vault secret (same as in slave API)                                                                          |
| <br>                      | <br>                                          | <br>                                                     | <br>                                         | <br>                                                                                                                      |
