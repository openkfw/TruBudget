# Create a New Network Directly on Machine

This guide describes how to create a new network without the use of Docker, Docker-Compose or Kubernetes. Before starting the network make sure to [install the necessary software on your machine.](../connect-to-existing-node/bare-metal.md)

## Table of Contents

- [Create a New Network Directly on Machine](#create-a-new-network-directly-on-machine)
  - [Table of Contents](#table-of-contents)
  - [Get the repository](#get-the-repository)
  - [Blockchain](#blockchain)
  - [API](#api)
    - [Log-Rotation](#log-rotation)
  - [Excel Export](#excel-export)
    - [Set Environment Variables](#set-environment-variables)
    - [Install Node Modules](#install-node-modules)
    - [Start the Service](#start-the-service)
  - [Provisioning](#provisioning)
    - [Set environment variables](#set-environment-variables)
    - [Install node-modules](#install-node-modules)
    - [Start the Provisioning](#start-the-provisioning)
  - [Frontend](#frontend)

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

Set the following environment variables to deploy a new Blockchain network:

```bash
export P2P_PORT=7447
export RPC_PORT=8000
export RPC_USER="multichainrpc"
export RPC_PASSWORD="password"
export MULTICHAIN_DIR="/root"
```

Navigate into the `blockchain` directory and install the node packages defined in the `package.json` and start the Blockchain with:

```bash
cd blockchain/
npm install
npm start > startup.log 2>&1 &
```

The information within `startup.log` should look similar to:

```bash
> ACMECorp-chain-bc@0.1.0 start /[MULTICHAIN_DIR]/TruBudget/blockchain
> node src/index.js

Provisioning mc

MultiChain 2.0 alpha 2 Utilities (latest protocol 20002)

Blockchain parameter set was successfully generated.
You can edit it in /[MULTICHAIN_DIR]/.multichain/TrubudgetChain/params.dat before running multichaind for the first time.

To generate blockchain please run "multichaind TrubudgetChain -daemon".
App listening on 8085
stdout: Looking for genesis block...

stdout: Genesis block found


stdout: Other nodes can connect to this node using:
multichaind TrubudgetChain@172.17.0.3:7447


stdout: Node ready.
```

## API

Set the environment parameters listed below on the machine:

```bash
export ORGANIZATION=MyOrga
export P2P_PORT=7447
export RPC_PORT=8000
export PORT=8080
export RPC_HOST=127.0.0.1
export RPC_USER=multichainrpc
export RPC_PASSWORD=password
export ORGANIZATION_VAULT_SECRET=secret
export ROOT_SECRET=root-secret
```

Once Node.js is installed navigate into the `api` directory and run the following commands to start the API:

```bash
cd ../api
npm install
npm run build
node dist > api.log 2>&1 &
```

You can then check the api log via

```bash
cat api.log
```

The `api.log` for a new Blockchain network should look similar to:

```bash
[2018-10-03T09:36:08.872Z] INFO (TruBudget/4858 on 0a18bc69cac8): Connecting to MultiChain node
    protocol: "http"
    host: "127.0.0.1"
    port: 8000
    username: "multichainrpc"
    password: "password"
Register fastify endpoint
schema id ignored er58c69eg298c87e3899119e025eff1f
schema id ignored fe9c2b24ade9a92360b3a898665678ac
[2018-10-03T09:36:09.193Z] INFO (TruBudget/4858 on 0a18bc69cac8): server is listening on 8080
[2018-10-03T09:36:09.224Z] INFO (TruBudget/4858 on 0a18bc69cac8): MultiChain connection established
[2018-10-03T09:36:09.228Z] DEBUG (TruBudget/4858 on 0a18bc69cac8): Created stream org:MyOrga with options {"kind":"organization","name":"org:MyOrga"}
[2018-10-03T09:36:09.232Z] TRACE (TruBudget/4858 on 0a18bc69cac8):
    addressFromWallet: "[redacted]"
    privkey: "[redacted]"
[2018-10-03T09:36:09.237Z] TRACE (TruBudget/4858 on 0a18bc69cac8): wrote hex string to chain: 282 bytes
[2018-10-03T09:36:09.237Z] INFO (TruBudget/4858 on 0a18bc69cac8): Initializing organization address to local wallet address: [redacted]
[2018-10-03T09:36:09.238Z] DEBUG (TruBudget/4858 on 0a18bc69cac8): Publishing wallet address to org:MyOrga/"address"
[2018-10-03T09:36:09.241Z] INFO (TruBudget/4858 on 0a18bc69cac8): organization address: [redacted]
[2018-10-03T09:36:09.244Z] DEBUG (TruBudget/4858 on 0a18bc69cac8): Created stream users:MyOrga with options {"kind":"users","name":"users:MyOrga"}
[2018-10-03T09:36:09.244Z] INFO (TruBudget/4858 on 0a18bc69cac8): organization stream present
[2018-10-03T09:36:09.247Z] INFO (TruBudget/4858 on 0a18bc69cac8): node registered in nodes stream
Publishing network.registerNode to nodes/"[redacted]"
[2018-10-03T09:36:09.257Z] DEBUG (TruBudget/4858 on 0a18bc69cac8): Created stream nodes with options {"kind":"nodes","name":"nodes"}
Publishing network.registerNode to nodes/"[redacted]"
```

### Log-Rotation

As stated above, the API logs are printed to `api.log`. For operational purposes it is useful to have an application that manages the process and takes care of log rotation (i.e. breaking the logs into smaller chunks). Luckily, there are several applications that are capable of doing exactly that. One of them is PM2, which we will describe here shortly.

PM2 is an application that handles node processes for you and restarts it after a crash. PM2 can be installed via the following command

```bash
npm install -g pm2
```

It offers a wide range of plugins called "Modules" that can be installed via PM2 directly. One of these modules is called "pm2-logrotate" which can be used to rotate logs (e.g. split them into chunks of certain size or create separate files for each day) and the command to install it is simply

```bash
pm2 install pm2-logrotate
```

You can [set up](https://github.com/keymetrics/pm2-logrotate) pm2-logrotate (if needed) with the following command

```bash
pm2 set pm2-logrotate:<param> <value>
```

e.g:

```bash
pm2 set pm2-logrotate:max_size 1K (sets max. file size to 1KB)
pm2 set pm2-logrotate:compress true (compresses logs when rotated)
pm2 set pm2-logrotate:rotateInterval '*/1 * * * *' (force rotate every minute, syntax similar to CRON)
```

```bash
cd api
pm2 start dist/index.js
```

This is just an example. Please refer to the [official documentation](http://pm2.keymetrics.io/) for more information.

## Excel Export

To enable the export of TruBudget data into Excel files, a separate service needs to be started. To start that service, first change the directory to the `excel-export-service` folder:

```bash
cd ../excel-export-service
```

### Set Environment Variables

The following environment variables need to be set:

- Terminal Mac/Git Bash

```bash
export PROD_API_HOST=127.0.0.1
export TEST_API_HOST=127.0.0.1
export PROD_API_PORT=8080
export TEST_API_PORT=8081
export PORT=8888
export ACCESS_CONTROL_ALLOW_ORIGIN="*"
```

- Terminal Windows/Command Shell

```bash
SET PROD_API_HOST=127.0.0.1
SET TEST_API_HOST=127.0.0.1
SET PROD_API_PORT=8080
SET TEST_API_PORT=8081
SET PORT=8888
SET ACCESS_CONTROL_ALLOW_ORIGIN="*"
```

### Install Node Modules

Install the node modules via

```bash
npm install
```

### Start the Service

```bash
npm start
```

## Provisioning

The Provisioning fills the blockchain with test-data.
To start the provisioning, open your favorite shell, navigate to your provisioning folder and follow these instructions:

```bash
cd ../provisioning
```

### Set environment variables

"API_PORT", "ROOT_SECRET" and "ORGANIZATION" variables have to be the same as when starting the API.

- Terminal Mac/Git Bash

```bash
export API_PORT=8080
export ORGANIZATION="MyOrga"
export ROOT_SECRET=root-secret
```

- Terminal Windows/Command Shell

```bash
SET API_PORT = 8080
SET ORGANIZATION = "MyOrga"
SET ROOT_SECRET = root-secret
```

### Install node-modules

```
npm install
```

### Start the Provisioning

```
npm start
```

## Frontend

The first step to deploy the frontend is to **adapt** and set the environment parameters. If you plan to deploy only one API set PROD and TEST parameters, so that it points to the single API.

```bash
cd ../frontend

export PROD_API_HOST=127.0.0.1
export PROD_API_PORT=8080
export TEST_API_HOST=127.0.0.1
export TEST_API_PORT=8080
```

Navigate into the `frontend` directory and copy the nginx.conf into the designated nginx directory with:

```bash
cp nginx.conf /etc/nginx/conf.d/default.conf
```

Install the node packages and start the production build:

```bash
npm install
npm run build
```

Once the build was successful copy the build sources into the `html` directory of nginx:

```
cp -R build/* /usr/share/nginx/html
```

The final step is to modify the nginx configuration, so that nginx points to the previous configured API instances.

Caution: It's possible that nginx was automatically started after installation. To check if this is the case run

```bash
ps aux | grep nginx
```

If you see matching entries, simply run

```bash
nginx -s stop
```

to stop all running processes.

To start the frontend, run the following command:

```bash
/bin/bash configureServer.sh
```

As soon as the step above is done, the frontend should be available on port 80. Make sure that port 80 is exposed and not blocked by any firewall or other processes.
