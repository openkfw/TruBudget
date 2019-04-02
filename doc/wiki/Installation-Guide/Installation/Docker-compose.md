This section describes how to deploy the TruBudget components with the usage of Docker Compose.

We distinguish between two types of deployments. On the one hand side we have the **local** deployment type which will deploy your local copy of the source code, along with any changes you might have done; on the other hand we have the **master** deployment type that will deploy Docker images out of the ACMECorp Docker registry.

The deployments are abstracted through shell scripts. We expect you to have a UNIX-like operating system which can execute shell scripts, e.g. Ubuntu. If not, take a look at the scripts and port them according to your operating system.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Prerequisites](#prerequisites)
  - [Docker & Docker Compose](#docker--docker-compose)
  - [Verify version](#verify-version)
  - [Clean installation](#clean-installation)
- [Create a new Blockchain network](#create-a-new-blockchain-network)
- [Connect to an existing Blockchain network](#connect-to-an-existing-blockchain-network)

## Prerequisites

### Docker & Docker Compose

The whole deployment is based on Docker and Docker Compose, therefore please follow the instructions on how to setup [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/#install-compose) (find an Ubuntu-related guide [here](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)).

You need at least docker engine version 17.09.

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

If this is a new checkout, you need to put the password for the registry into a file called `DOCKER_REGISTRY_PASSWORD`.

```bash
echo 'password' > DOCKER_REGISTRY_PASSWORD
```

### Clean installation

To start a new Blockchain network without previously stored data, remove the Docker volumes with:

```bash
rm -r /tmp/bc*
```

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

Currently both Blockchain containers store their data in `/tmp/bc*` directories.
Adapt the paths to your needs - you can change them in the respective docker-compose file, where you will find them under `volumes`:

```yaml
volumes:
  - /tmp/bcMasterVolume:/root/.multichain
```

The next step is to set all required environment properties, otherwise Docker will not receive the required parameters to start the deployment.
In the `TruBudget` folder, copy the `.env_example` file and rename it to `.env`:

```bash
cp .env_example .env
```

The `.env` file to create a new Blockchain network should consist of the following parameters:

```bash
# Name of the chain that you want to create
CHAINNAME=TrubudgetChain
# The name of your organization
ORGANIZATION=TheOrganization
# Define and store the secret.
# That secret is required if you want to add additional Blockchain nodes for your organization.
ORGANIZATION_VAULT_SECRET=secret
# The local port where the API should be exposed
API_PORT=8080
# The port where the RPC interface of the blockchain should be exposed
RPC_PORT=8000
# Indicates which docker images to use. It is recommended to use **release** tags.
TAG=release-1-0-0-beta-1
# The password of the root user
ROOT_SECRET=root-secret

```

Assuming that all parameters are set, go ahead and start the deployment.

To deploy the **current codebase** of the repository, run the following command:

```bash
scripts/local/start-master-node.sh
```

Deploy images **of the Docker registry** with:

```bash
scripts/master/start-master-node.sh
```

Once all components are up and running, the information in the log should look similar to:

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

Currently both Blockchain containers store their data in `/tmp/bc*` directories.
Adapt the paths to your needs - you can change them in the respective docker-compose file, where you will find them under `volumes`:

```yaml
volumes:
  - /tmp/bcMasterVolume:/root/.multichain
```

_Windows users_: With Docker for Windows it's not possible to mount the volumes with this configuration. To be able do use the Docker-Compose installation you need to comment (or remove) the lines with the `volumes` configuration.

The next step is to set all required environment properties, otherwise Docker will not receive the required parameters to start the deployment.
In the `TruBudget` folder, copy the `.env_example` file and rename it to `.env`:

```bash
cp .env_example .env
```

The `.env` file to connect to an existing Blockchain network should consist of the following parameters:

```bash
# Name of the chain that you want to join
CHAINNAME=TrubudgetChain
# The name of your organization
ORGANIZATION=TheOrganization
# Define and store the secret.
# That secret is required if you want to add additional Blockchain nodes for your organization.
ORGANIZATION_VAULT_SECRET=secret
# The local port where the API should be exposed
API_PORT=8080
# The port where the RPC interface of the blockchain should be exposed
RPC_PORT=8000
# Indicates which docker images to use. It is recommended to use **release** tags.
TAG=release-1-0-0
# The password of the root user
ROOT_SECRET=root-secret
# The ip/hostname of an admin blockchain node in test environment
P2P_TEST_HOST=127.0.0.1
# The peer-to-peer port of the admin blockchain node in test environment
P2P_TEST_PORT=7448
# The ip/hostname of the api in test environment
API_TEST_HOST=127.0.0.1
# The port where the ip/hostname above exposes the api
API_TEST_PORT=8081
# The ip/hostname of an admin blockchain node in production environment
P2P_PROD_HOST=127.0.0.1
# The peer-to-peer port of the admin blockchain node in production environment
P2P_PROD_PORT=7447
# The ip/hostname of the api in production environment
API_PROD_HOST=127.0.0.1
# The port where the ip/hostname above exposes the api
API_PROD_PORT=8080

```

Assuming that all parameters are set, go ahead and start the deployment.

To deploy the **current codebase** of the repository, run the following command:

```bash
scripts/local/start-slave-node.sh
```

Deploy images **of the Docker registry** with:

```bash
scripts/master/start-slave-node.sh
```

As long as you are not approved by the blockchain network, your blockchain nodes will constantly try to connect. Therefore please ask **organizations** with admin nodes to approve your registration.

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

You are now successfully connected to the network and should be able to access the frontend via port 80 on the server that it is running on. Use the **root** user and the password that was defined in the .env file to initially login to the frontend and to create users of your organization.
