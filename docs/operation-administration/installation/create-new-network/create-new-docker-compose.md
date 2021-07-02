# Create a New Network with Docker-Compose

This guide describes how to start a new instance of Trubudget using docker-compose.

We distinguish between two types of deployments:

- The **local** deployment type which will create images from the code you have on your local machine and includes any changes you might have done
- The **master** deployment type that will deploy Docker images out of the Docker Hub

:::note
For the master deployment, you can use tags to specify the version you want to use
:::

The deployments are abstracted through shell scripts. We expect you to have a UNIX-like operating system which can execute shell scripts, e.g. Ubuntu. If not, take a look at the scripts and port them according to your operating system.

## Table of Contents

- [Create a New Network with Docker-Compose](#create-a-new-network-with-docker-compose)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
    - [Docker & Docker Compose](#docker--docker-compose)
    - [Ports](#ports)
    - [Verify version](#verify-version)
    - [Clean installation](#clean-installation)
  - [Create a new Blockchain network](#create-a-new-blockchain-network)

## Prerequisites

### Docker & Docker Compose

The whole deployment is based on Docker and Docker Compose, therefore please follow the instructions on how to setup [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/#install-compose) (find an Ubuntu-related guide [here](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)).

You need at least docker engine version 17.06.

### Ports

Make sure that the following ports are not blocked by other processes: `80`, `8080`, `8081`, `7447`, `7448`

### Verify version

Start with checking out the repository:

```bash
git clone https://github.com/openkfw/TruBudget
cd TruBudget
```

This will create a local copy of the source code in a folder called `TruBudget` (= your local checkout).

If you work with an existing checkout, make sure you have the latest changes:

```bash
git pull
```

In order to pull the images from the Docker Hub, you need to be logged in with your Docker credentials.

### Clean installation

If you have previously started a TruBudget instance and want to start a new Blockchain network without previously stored data, remove the Docker volumes with:

```bash
rm -r /tmp/bc*
```

If this is either your first time starting TruBudget or you want to resume where you left off, skip this step.

## Create a new Blockchain network

Each Blockchain container comes with its own volume that persists the data of the Blockchain.
To modify the host path, meaning the path where the data will be persisted on your local machine, navigate to the docker-compose file:

```
docker-compose/master/master-node.yml
```

If you want to run the network with your local sources, update the volume in the following file:

```bash
docker-compose/local/master-node.yml
```

Currently both Blockchain containers store their data in `/tmp/bc*` directories. This works fine for testing, but _should not be used in productive environments_ since the `/tmp/` folder is emptied after reboot on most Unix-like systems.

Adapt the paths to your needs - you can change them in the respective docker-compose file, where you will find them under `volumes`:

```yaml
volumes:
  - /tmp/bcMasterVolume:/root/.multichain
```

The next step is to set all required environment properties, otherwise Docker will not receive the required parameters to start the deployment.
If you want to start with the standard configuration we reccomend copying the `.env_example` file and rename it to `.env` in the `TruBudget` base folder:

```bash
cp .env_example .env
```

The `.env` file to create a new Blockchain network should consist of the following parameters:

```bash
API_PORT=8080
RPC_PORT=8000
ORGANIZATION=TheOrganization
ORGANIZATION_VAULT_SECRET=secret
TAG=master
ROOT_SECRET=root-secret
LOG_LEVEL=INFO
PRETTY_PRINT=true
RPC_PASSWORD=s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j
MULTICHAIN_DIR="/root"
EXTERNAL_IP=
```

:::note
For detailed explenations of the environment variables, see the [Enviroment Variables](./../../../enviroment-variables.md)
:::
To deploy the **current codebase** of the repository with an empty blockchain, run the following command:

```bash
scripts/local/start-master-node.sh
```

Deploy images **of the Docker registry** with an empty blockchain with:

```bash
scripts/master/start-master-node.sh
```

If you want to start with a fixed set of projects, subprojects, workflowitems and users, you can start a so called 'provisioned blockchain' for master development with:

```bash
scripts/master/start-and-provision-master-node.sh
```

or for local development with:

```bash
scripts/local/start-and-provision-master-node.sh
```

Once all components are up and running, the information after provisioning in the log should look similar to:

```bash
testapi_1         | POST /api/workflowitem.intent.grantPermission [user=mstein body={"apiVersion":"1.0","data":{"projectId":"2ac3cfed87f243c7ef05f8d3aff3e656","subprojectId":"b829cb0de28d621435ed5e66fe16255f","workflowitemId":"1d734c6c12f1d5e2cd112856ea39ae1e","intent":"workflowitem.update","identity":"rfinance"}}]
testapi_1         | Publishing workflowitem.intent.grantPermission to 2ac3cfed87f243c7ef05f8d3aff3e656/["b829cb0de28d621435ed5e66fe16255f_workflows","1d734c6c12f1d5e2cd112856ea39ae1e"]
testapi_1         |
testapi_1         | POST /api/workflowitem.intent.grantPermission [user=mstein body={"apiVersion":"1.0","data":{"projectId":"2ac3cfed87f243c7ef05f8d3aff3e656","subprojectId":"b829cb0de28d621435ed5e66fe16255f","workflowitemId":"1d734c6c12f1d5e2cd112856ea39ae1e","intent":"workflowitem.intent.listPermissions","identity":"atutelle"}}]
testapi_1         | Publishing workflowitem.intent.grantPermission to 2ac3cfed87f243c7ef05f8d3aff3e656/["b829cb0de28d621435ed5e66fe16255f_workflows","1d734c6c12f1d5e2cd112856ea39ae1e"]
testapi_1         |
testapi_1         | POST /api/workflowitem.intent.grantPermission [user=mstein body={"apiVersion":"1.0","data":{"projectId":"2ac3cfed87f243c7ef05f8d3aff3e656","subprojectId":"b829cb0de28d621435ed5e66fe16255f","workflowitemId":"1d734c6c12f1d5e2cd112856ea39ae1e","intent":"workflowitem.intent.grantPermission","identity":"atutelle"}}]
testapi_1         | Publishing workflowitem.intent.grantPermission to 2ac3cfed87f243c7ef05f8d3aff3e656/["b829cb0de28d621435ed5e66fe16255f_workflows","1d734c6c12f1d5e2cd112856ea39ae1e"]
testapi_1         |
testapi_1         | POST /api/workflowitem.intent.grantPermission [user=mstein body={"apiVersion":"1.0","data":{"projectId":"2ac3cfed87f243c7ef05f8d3aff3e656","subprojectId":"b829cb0de28d621435ed5e66fe16255f","workflowitemId":"1d734c6c12f1d5e2cd112856ea39ae1e","intent":"workflowitem.intent.revokePermission","identity":"atutelle"}}]
testapi_1         | Publishing workflowitem.intent.grantPermission to 2ac3cfed87f243c7ef05f8d3aff3e656/["b829cb0de28d621435ed5e66fe16255f_workflows","1d734c6c12f1d5e2cd112856ea39ae1e"]
provision-test_1  | Subproject "Primary School" > "Equipment" created.
provision-test_1  | Project "Primary School" created.
trubudget_provision-test_1 exited with code 0
```

No need to worry regarding the provisioning container. Both provisioning containers (provision-test, provision-prod) will exit with **error code 0** once the network was successfully provisioned.

The **frontend** should be accessible via port 80 on the server that it is running on.
