# Connect to an existing Blockchain network using docker

This guide describes how to connect to an existing network using of Docker and Docker-Compose.
Before starting make sure to have docker and docker-compose available on your machine.

## Table of Contents

## Trubudget Docker Images

Trubudget's docker images are published on [docker-hub](https://hub.docker.com/u/trubudget).
It is recommended to use a specific version tag like v.1.20.0 instead of the main or latest tag.

:::hint
Only use main or latest tag if a code change of these versions is needed.
:::

## Blockchain

A `beta node` is a Trubudget node which connects to an existing Trubudget network.
To understand the connection process read the [approval process documentation](./connection-process.md).

### Environment Variables

To establish a connection to an existing Trubudget network following conditions must be met:

1. For a description of all Environment variables, see [environment variables](../../../environment-variables.md).
   This table gives an overview how to set the env vars correctly, so the beta node can connect to the alpha node.
   Empty entries mean that setting that env var has no effect.

| Name of env var           | Alpha API                                    | Alpha Blockchain                                                                                                       | Beta API                                    | Beta Blockchain                                      |
| ------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| EXTERNAL_IP               |                                              | \_must not                                                                                                             |
| set\_                     |                                              | public IP-address and Port of the alpha Blockchain (optional, not necessary if alpha and beta are in the same network) |
| P2P_HOST                  |                                              | \_must not                                                                                                             |
| set\_                     |                                              | private IP-address of the alpha Blockchain                                                                             |
| P2P_PORT                  |                                              | set a port                                                                                                             |                                             | P2P_PORT of the alpha Blockchain                     |
| <br/>                     | <br/>                                        | <br/>                                                                                                                  | <br/>                                       | <br/>                                                |
| API_HOST                  |                                              | IP-address of alpha API                                                                                                |                                             | IP-address of the Beta API                           |
| API_PORT                  |                                              | PORT of alpha API                                                                                                      |                                             | PORT of the Beta API                                 |
| <br/>                     | <br/>                                        | <br/>                                                                                                                  | <br/>                                       | <br/>                                                |
| PORT                      | set a port                                   | set a port                                                                                                             | set a port                                  | set a port                                           |
| <br/>                     | <br/>                                        | <br/>                                                                                                                  | <br/>                                       | <br/>                                                |
| MULTICHAIN_RPC_HOST       | IP-address of alpha blockchain               | set a port                                                                                                             | set a port                                  | set a port                                           |
| MULTICHAIN_RPC_PORT       | MULTICHAIN_RPC_PORT of alpha blockchain      | set a port                                                                                                             | MULTICHAIN_RPC_PORT of beta blockchain      | set a port                                           |
| MULTICHAIN_RPC_PASSWORD   | same password as in alpha blockchain         | set a password                                                                                                         | same password as in beta blockchain         | set a password                                       |
| <br/>                     | <br/>                                        | <br/>                                                                                                                  | <br/>                                       | <br/>                                                |
| ORGANIZATION              | organization name of alpha node              | organization name of alpha node (same as in alpha API)                                                                 | organization name of beta node              | organization name of beta node (same as in beta API) |
| ORGANIZATION_VAULT_SECRET | organization vault secret of your alpha node | organization vault secret (same as in alpha API)                                                                       | organization vault secret of your beta node | organization vault secret (same as in beta API)      |
| <br/>                     | <br/>                                        | <br/>                                                                                                                  | <br/>                                       | <br/>                                                |
