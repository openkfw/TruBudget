# Connect to an Existing Network using Docker

This guide describes how to connect a node to an existing TruBudget network. The steps are the same for new organizations and new nodes for an existing organizations. For new nodes of existing organizations, make sure to use the same `ORGANIZATION_VAULT_SECRET` as all the other nodes of this organization.

## Table of Contents

- [Connect to an existing Blockchain network](#connect-to-an-existing-blockchain-network)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
    - [Docker & Docker Compose](#docker--docker-compose)
    - [Ports](#ports)
  - [Table of Contents](#table-of-contents-1)
  - [Prerequisites](#prerequisites-1)
    - [Docker & Docker Compose](#docker--docker-compose-1)
    - [Ports](#ports-1)
  - [Connect to an existing Blockchain network](#connect-to-an-existing-blockchain-network-1)

## Prerequisites

### Docker & Docker Compose

The whole deployment is based on Docker and Docker Compose, therefore please follow the instructions on how to setup [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/#install-compose) (find an Ubuntu-related guide [here](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)).

You need at least docker engine version 17.06.

### Ports

Make sure that the following ports are not blocked by other processes: `80`, `8080`, `8081`, `7447`, `7448`

We distinguish between two types of deployments:

- The **local** deployment type which will create images from the code you have on your local machine and includes any changes you might have done
- The **master** deployment type that will deploy Docker images out of the Docker Hub

:::note
Note: For the master deployment, you can use tags to specify the version you want to use
:::

## Connect to an existing Blockchain network

Each Blockchain container comes with its own volume that persists the data of the Blockchain.
To modify the host path, meaning the path where the data will be persisted on your local machine, navigate to the docker-compose file:

```
docker-compose/master/slave-node.yml
```

If you want to run the network with your local sources, update the volume in the following file:

```bash
docker-compose/local/slave-node.yml
```

Currently both Blockchain containers store their data in `/tmp/bc*` directories. This works fine for testing, but _should not be used in productive environments_ since the `/tmp/` folder is emptied after reboot on most Unix-like systems.

Adapt the paths to your needs - you can change them in the respective docker-compose file, where you will find them under `volumes`:

```yaml
volumes:
  - /tmp/bcMasterVolume:/root/.multichain
```

_Windows users_: With Docker for Windows it's not possible to mount the volumes with this configuration. To be able do use the Docker-Compose installation you need to comment (or remove) the lines with the `volumes` configuration.

The next step is to set all required environment properties, otherwise Docker will not receive the required parameters to start the deployment.
If you want to start with the standard configuration we reccomend copying the `.env_example` file and rename it to `.env` in the `TruBudget` base folder:

```bash
cp .env_example .env
```

The `.env` file to connect to an existing Blockchain network should consist of the following parameters:

```bash
API_PORT=8080
RPC_PORT=8000
ORGANIZATION=TheNewOrganization
ORGANIZATION_VAULT_SECRET=secret
TAG=master
ROOT_SECRET=root-secret
P2P_TEST_HOST=52.52.52.52
P2P_TEST_PORT=7448
API_TEST_HOST=52.52.52.52
API_TEST_PORT=8081
P2P_PROD_HOST=52.52.52.52
P2P_PROD_PORT=52.52.52.52
API_PROD_HOST=52.52.52.52
API_PROD_PORT=8080
LOG_LEVEL=INFO
PRETTY_PRINT=true
RPC_PASSWORD=s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j
MULTICHAIN_DIR="/root"
EXTERNAL_IP=50.50.50.50
```

:::note
For detailed explenations of the environment variables, see the [Enviroment Variables](./../../../enviroment-variables.md)
:::
Assuming that all parameters are set, go ahead and start the deployment.

To deploy the **current codebase** of the repository, run the following command:

```bash
scripts/local/start-slave-node.sh
```

Deploy images **of the Docker registry** with:

```bash
scripts/master/start-slave-node.sh
```

As long as you are not approved by the blockchain network, your blockchain nodes will constantly try to connect. Therefore please ask other **organizations** with admin nodes to approve your registration.

Before approval, the log will look similar to this:

```bash
test-bc-slave_1  | multichaind  | Blockchain successfully initialized.
test-bc-slave_1  |
test-bc-slave_1  | Please ask blockchain admin or user having activate permission to let you connect and/or transact:
test-bc-slave_1  | multichain-cli TrubudgetChain grant 1QSUFKSXTmHtpNYykuuFuZaxfMR6sJwS91kG2u connect
test-bc-slave_1  | multichain-cli TrubudgetChain grant 1QSUFKSXTmHtpNYykuuFuZaxfMR6sJwS91kG2u connect,send,receive
bc-slave_1  | multichaind  | Blockchain successfully initialized.
bc-slave_1  |
bc-slave_1  | Please ask blockchain admin or user having activate permission to let you connect and/or transact:
bc-slave_1  | multichain-cli TrubudgetChain grant 1QSUFKSXTmHtpNYykuuFuZaxfMR6sJwS91kG2u connect
bc-slave_1  | multichain-cli TrubudgetChain grant 1QSUFKSXTmHtpNYykuuFuZaxfMR6sJwS91kG2u connect,send,receive
```

Once your nodes are approved the log should look similar to:

```bash
bc-slave_1       | multichaind  | Other nodes can connect to this node using:
bc-slave_1       | multichaind TrubudgetChain@172.22.0.2:7447
bc-slave_1       |
bc-slave_1       |
bc-slave_1       | multichaind  | Node ready.
bc-slave_1       |
bc-slave_1       |
test-bc-slave_1  | >>> Connecting to TrubudgetChain@192.0.0.1:7448
test-bc-slave_1  | >>> args=-txindex,-port=7448,-autosubscribe=streams,TrubudgetChain@192.0.0.1:7448
test-bc-slave_1  | >> /root/.multichain/multichain.conf rpcport=8000
test-bc-slave_1  | rpcuser=multichainrpc
test-bc-slave_1  | rpcpassword=[redacted]
test-bc-slave_1  | rpcallowip=0.0.0.0/0
test-bc-slave_1  |
test-bc-slave_1  | >> /root/.multichain/TrubudgetChain/multichain.conf rpcport=8000
test-bc-slave_1  | rpcuser=multichainrpc
test-bc-slave_1  | rpcpassword=[redacted]
test-bc-slave_1  | rpcallowip=0.0.0.0/0
test-bc-slave_1  |
test-bc-slave_1  | multichaind  | Retrieving blockchain parameters from the seed node 192.0.0.1:7448 ...
test-bc-slave_1  |
test-bc-slave_1  | multichaind  | Other nodes can connect to this node using:
test-bc-slave_1  | multichaind TrubudgetChain@172.22.0.3:7448
test-bc-slave_1  |
test-bc-slave_1  |
test-bc-slave_1  | multichaind  | Node ready.
test-bc-slave_1  |
test-bc-slave_1  |
api_1            | Connecting to MultiChain node at http://bc-slave:8000
api_1            | server is listening on 8080
testapi_1        | Connecting to MultiChain node at http://test-bc-slave:8000
testapi_1        | server is listening on 8080
api_1            | [2018-08-10T08:42:37.357Z] DEBUG (TruBudget/1 on e0fdf1eb41e2): Created stream org:TheOrganizat with options {"kind":"organization","name":"org:TheOrganizat"}
api_1            | [2018-08-10T08:42:37.372Z] TRACE (TruBudget/1 on e0fdf1eb41e2):
api_1            |     addressFromWallet: "[redacted]"
api_1            |     privkey: "[redacted]"
testapi_1        | [2018-08-10T08:42:37.387Z] DEBUG (TruBudget/1 on 14d2111cc40d): Created stream org:TheOrganizat with options {"kind":"organization","name":"org:TheOrganizat"}
api_1            | [2018-08-10T08:42:37.387Z] TRACE (TruBudget/1 on e0fdf1eb41e2): wrote hex string to chain: 282 bytes
api_1            | [2018-08-10T08:42:37.387Z] INFO (TruBudget/1 on e0fdf1eb41e2): Initializing organization address to local wallet address: [redacted]
api_1            | [2018-08-10T08:42:37.387Z] DEBUG (TruBudget/1 on e0fdf1eb41e2): Publishing wallet address to org:TheOrganizat/"address"
testapi_1        | [2018-08-10T08:42:37.399Z] TRACE (TruBudget/1 on 14d2111cc40d):
testapi_1        |     addressFromWallet: "[redacted]"
testapi_1        |     privkey: "[redacted]"
api_1            | [2018-08-10T08:42:37.407Z] INFO (TruBudget/1 on e0fdf1eb41e2): organization address: [redacted]
testapi_1        | [2018-08-10T08:42:37.420Z] TRACE (TruBudget/1 on 14d2111cc40d): wrote hex string to chain: 282 bytes
testapi_1        | [2018-08-10T08:42:37.421Z] INFO (TruBudget/1 on 14d2111cc40d): Initializing organization address to local wallet address: [redacted]
testapi_1        | [2018-08-10T08:42:37.421Z] DEBUG (TruBudget/1 on 14d2111cc40d): Publishing wallet address to org:TheOrganizat/"address"
testapi_1        | [2018-08-10T08:42:37.435Z] INFO (TruBudget/1 on 14d2111cc40d): organization address: [redacted]
api_1            | [2018-08-10T08:42:37.445Z] DEBUG (TruBudget/1 on e0fdf1eb41e2): Created stream users:TheOrganiz with options {"kind":"users","name":"users:TheOrganiz"}
testapi_1        | [2018-08-10T08:42:37.474Z] DEBUG (TruBudget/1 on 14d2111cc40d): Created stream users:TheOrganiz with options {"kind":"users","name":"users:TheOrganiz"}
```

You are now successfully connected to the network and should be able to access the frontend via port 80 on the server that it is running on. Use the **root** user and the password that was defined in the `.env` file to initially login to the frontend and to create users of your organization.
