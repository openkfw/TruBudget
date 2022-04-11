# Create a new Network with Docker-Compose

This guide describes how to start a new instance of Trubudget using docker-compose.

We distinguish between two types of deployments:

- The **local** deployment type which will create images from the code you have on your local machine and includes any changes you might have done
- The **alpha** deployment type that will deploy Docker images out of the Docker Hub

:::note
For the alpha deployment, you can use tags to specify the version you want to use
:::

The deployments are abstracted through shell scripts. We expect you to have a UNIX-like operating system which can execute shell scripts, e.g. Ubuntu. If not, take a look at the scripts and port them according to your operating system.

## Table of Contents

- [Create a new Network with Docker-Compose](#create-a-new-network-with-docker-compose)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
    - [Docker & Docker Compose](#docker--docker-compose)
    - [Ports and IP Addresses for TruBudget](#ports-and-ip-addresses-for-trubudget)
    - [Verify version of TruBudget](#verify-version-of-trubudget)
    - [Clean installation](#clean-installation)
  - [Create a new Blockchain network](#create-a-new-blockchain-network)
  - [Create a new Blockchain network with two organization](#create-a-new-blockchain-network-with-two-organization)
    - [Example](#example)

## Prerequisites

### Docker & Docker Compose

The whole deployment is based on Docker and Docker Compose, therefore you need to install [Docker](https://www.docker.com/community-edition#/download) (version 20.10.7 or higher) and [Docker Compose](https://docs.docker.com/compose/install/) (version 1.29.2 or higher).

### Ports and IP Addresses for TruBudget

Make sure that the following ports are not blocked by other processes: `3000`, `8080`, `8090`, `9000`, `8081`, `7447`, `7448`.
Also make sure that IPv4 subnet mask `172.21.0.0/24` is free to use on your computer.

If the subnet mask or some ports are already used by other processes or programs, you can easily change the port in the `.env` file that is located in `/scripts/operations/`.

### Verify version of TruBudget

Start with checking out the repository:

```bash
git clone https://github.com/openkfw/TruBudget
cd TruBudget
```

This will create a local copy of the latest source code in a folder called `TruBudget` (= your local checkout).

If you work with an existing checkout, make sure you have the latest changes:

```bash
git checkout main
git pull
```

### Clean installation

If you have previously started a TruBudget instance and want to start a new Blockchain network without previously stored data, remove the Docker volumes with:

```bash
sudo rm -r /alphaVolume
sudo rm -r /beta1Volume
sudo rm -r /minioVolume
sudo rm -r /emaildbVolume
```

If this is either your first time starting TruBudget or you want to resume where you left off, skip this step.

## Create a new Blockchain network

Each Blockchain container comes with its own volume that persists the data of the Blockchain.
To modify the host path, meaning the path where the data will be persisted on your local machine (docker volume), you can change it in the docker-compose file `scripts/operation/docker-compose.yml`.

The next step is to set all required environment properties, otherwise Docker will not receive the required parameters to start the deployment.
If you want to start with the standard configuration we recommend copying the `.env_example` file and rename it to `.env` in the `TruBudget` base folder:

```bash
cd scripts/operation/
cp .env_example .env
```

The `.env` in scripts/operation/ can be edited directly to fit your needs.

:::note
For detailed explanations of the environment variables, see the [Environment Variables](./../../../environment-variables.md)
:::

To start the TruBudget in an easy way, use the bash script `start-trubudget.sh`.

If you want to start a setup with one blockchain, frontend, API and provisioning (for test data), run:

```bash
cd scripts/operation/
bash start-trubudget.sh --slim
```

If you want to add an additional blockchain node, email-notification-service, excel-export-service or storage-service, please take a look at the [README.md of operation setup](https://github.com/openkfw/TruBudget/blob/main/scripts/operation/README.md#trubudget-operation-setup)

The **frontend** should be accessible via port 3000 on the server that it is running on: http://localhost:3000/

The **API Swagger documentation** should be accessible via port 8080 on the server that it is running on: http://localhost:8080/api/documentation/static/index.html

## Create a new Blockchain network with two organization

To connect two blockchains, you need to define exactly one master node and one or more slave nodes. The define a slave node, you must set the correct [Environmental variables](https://github.com/openkfw/TruBudget/blob/master/blockchain/README.md#environment-variables) in a blockchain node in order to

1. start a slave node with correct environmental variables
1. send access requests to the master node

To understand how to set the environment variables correctly, read [How to connect to a master node](https://github.com/openkfw/TruBudget/blob/master/docs/operation-administration/installation/connect-to-an-existing-network/how-to-connect-to-a-master-node.md).

If you want to know what exactly happens when blockchain nodes are connecting, read the description of the [Lifecycle](https://github.com/openkfw/TruBudget/blob/master/blockchain/README.md#Lifecycle).

### Example

The docker-compose file in `scripts/operation/` comes with one additional blockchain node (beta-node) that tries to connect to the alpha node after starting.
Each Blockchain container comes with its own volume that persists the data of the Blockchain.

To start TruBudget with two organizations (alpha and beta), run:

```bash
bash start-trubudget.sh --slim --add-organization
```

This will create the blockchain, API and frontend for each of both organizations.
You can access the frontend of the beta-node with http://localhost:3005/ and the for the alpha-node with http://localhost:3000/. This is defined in the `docker-compose.yml` file.
The beta-node must be approved by the alpha-node. This can be done with the root user in the alpha frontend at the page http://localhost:3000/nodes.
The name of both organization and other configurations are defined in the `.env` file (in the directory `scripts/operation/`).

:::note
If you need more beta-nodes, you have to change the `docker-compose.yml` file and `start-trubudget.sh` in the directory `scripts/operation/` by yourself.
:::
