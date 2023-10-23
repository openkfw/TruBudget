# TruBudget Blockchain

This project encapsulates the Multichain implementation for Trubudget. It can be seen as the data tier in Trubudget

## Getting started

The easiest way to get started is to use `docker compose`. (that means you need to install [Docker](https://www.docker.com/community-edition#/download)).

#### Run from Image

Navigate to the docker-compose folder under the project.

```bash
cd ../docker-compose
```

Copy the contents of the .env.example file into .env file.

```bash
cp .env.example .env
```

Then run the following docker compose command to start the blockchain:

```bash
docker compose --project-directory . -f blockchain/docker-compose.alphanode.yml up
```

This command would start the blockchain container, using the image version specified under `TAG` in the `.env` file, which is `main` when using the default `.env.example` file.

#### Run local build

Copy the contents of the .env.example file into .env file.

```bash
cp .env.example .env
```

Then run the following docker compose command to start a local build of the blockchain:

```bash
docker compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f blockchain/local-build.docker-compose.yml up
```

For more information about docker compose and starting whole Trubudget as an application, checkout the [Docker Compose](https://github.com/openkfw/TruBudget/tree/main/docker-compose) documentation.

Enjoy!

## Lifecycle

As described before: The Trubudget Blockchain is created by an alpha, then grants betas access on demand.

1.  Start Alpha-Node of Trubudget Blockchain (Alpha sets chain configurations for network and has admit privileges)
1.  Start API (Alpha-API)
1.  API will set up Alpha-Node for Trubudget (creating Admin-Streams)
1.  Start beta-Node(s)
1.  Beta-Node will try to join the network by connection to the alpha-node
    1.  If mutual authentication is enabled, the blockchain can only request to access the network when providing a valid certificate. In case the certificate is not valid, the Alpha API will reject the node immediately
1.  Beta-Node attempt to access the network will be rejected because they have not been granted access
1.  Beta-Node requests to be granted access to the network by sending its blockchain-address and information about the Organization operating the node to the Alpha-API
1.  Eventually, Alpha-API grants read/write (not admin) access to the network for the supplied address
1.  Beta-Node retries to join the network
1.  Beta-Node is granted access and synchronized blockchain data

## Alpha vs. Beta Node

Trubudget is a private Blockchain (BC) network. That means an Alpha need to give new nodes (betas) a one-time grant in order to access the network. The decision if I want to spawn an Alpha or a Beta node is simple:

- Alpha node: I want to create a new network
- Beta node: I want to participate on an existing network

## Mutual Authentication

Mutual Authentication is a feature that ensures that only nodes with a valid certificate can access the network.
A node, which wants to access the network, has to authenticate itself against the Alpha API with a valid certificate.
If the certificate is not valid, the API will reject the request. If the certificate is valid, the API will accept the connection and the user can approve the connection.
More information about mutual authentication can be found [here](https://www.cloudflare.com/en-gb/learning/access-management/what-is-mutual-authentication/).

## Configuration

The Blockchain node is fully configured through environment variables.

### Environment Variables

In TruBudget, we use different environment variables to set credentials as well as configurations of the TruBudget services. The environment variables used in the Blockchain can be seen here [Environment Variables](./environment-variables.md)
