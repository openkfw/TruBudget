# Connect to an existing Blockchain network on Machine

**It is highly recommended to use the [Docker-Compose Setup guide](./docker.md) instead of this Setup guide. Only use this guide if docker cannot be used**

This guide describes how to connect to an existing network without the use of Docker, Docker-Compose or Kubernetes.
Before starting make sure to have `node`,`npm` and the [latest release of MultiChain](https://www.multichain.com/download-community/) available on your machine.
To check if all required tools are installed correctly use following check commands:

- node: `node -v`
- npm: `npm -v`
- multichain: `multichain-util` & `multichaind`

If the above commands cannot be found make sure the tools are installed and the PATH variables are set correctly.

## Table of Contents

- [Connect to an existing Blockchain network on Machine](#connect-to-an-existing-blockchain-network-on-machine)
  - [Table of Contents](#table-of-contents)
  - [Get the repository](#get-the-repository)
  - [Blockchain](#blockchain)

## Get the repository

Clone the Github repository of the components onto the designated machines.

Clone the repository:

```
git clone https://github.com/openkfw/TruBudget.git
cd TruBudget
```

:::info
If you work with an existing checkout, make sure you have the latest changes:

```
git pull
```

:::

## Blockchain

A blockchain node defines itself as `beta node` if the environment variable `P2P_HOST` is set.

First make sure the alpha node has set its EXTERNAL_IP environment variable and is available (check firewall), otherwise it will not be possible to connect to the alpha node.
Adapt and set the environment parameters listed below.
A detailed description can be found in the [environment variable overview](../../../environment-variables.md)

```bash
export PRETTY_PRINT="true"
export ORGANIZATION="BetaOrga"
export MULTICHAIN_RPC_USER="multichainrpc"
export MULTICHAIN_RPC_PASSWORD="password"
export RPC_ALLOW_IP="0.0.0.0/0"
export MULTICHAIN_DIR="/tmp/beta"
export PORT=8086
export P2P_PORT=7447
export MULTICHAIN_RPC_PORT=8000
export API_PORT=8080
export P2P_HOST=[IP of alpha node]
export EXTERNAL_IP=[IP where this node is external available]
export API_HOST=[IP of alpha node API]
```

:::hint
Use absolute paths for environment variables.
If it's not the first start and the `.multichain` folder exists already a multichain error will be shown in the logs but multichain will work as expected.
(Error while creating Multichain
err: "ERROR: Blockchain parameter set was not generated.\n" )
:::

Navigate into the `blockchain` directory and install the node packages defined in the `package.json` and start the blockchain using following lines:

```bash
cd blockchain/
npm install
npm start
```

:::hint
To run the process as background process use `npm start > blockchain.log 2>&1 &`, the blockchain.log contains the logs of the blockchain process
:::

If the logs are showing the line `Node ready` the node is setup correctly.
The blockchain can be checked by HTTP-Request `localhost:8085/version` using postman, curl or even a browser. The response is the current version of TruBudget's blockchain.
