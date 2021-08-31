# Connect to an Existing Network on Bare Metal

This guide describes how to connect to an existing network without the use of Docker, Docker-Compose or Kubernetes.
Before starting make sure to have `node`,`npm` and the [latest release of MultiChain](https://www.multichain.com/download-community/) available on your machine.

## Table of Contents

- [Connect to an Existing Network Directly from Machine](#connect-to-an-existing-network-directly-from-machine)
  - [Table of Contents](#table-of-contents)
  - [Get the repository](#get-the-repository)
  - [Blockchain](#blockchain)
  - [API](#api)
    - [Log-Rotation](#log-rotation)
  - [Excel Export](#excel-export)
    - [Set Environment Variables](#set-environment-variables)
    - [Install Node Modules](#install-node-modules)
    - [Start the Service](#start-the-service)
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

To connect to an already existing Blockchain network **adapt** and set the following environment parameters:

```bash
export ORGANIZATION="YourOrga";
export RPC_PORT=8000;
export RPC_USER="multichainrpc";
export RPC_PASSWORD="password";
export RPC_ALLOW_IP="0.0.0.0/0";
export MULTICHAIN_DIR="/root"
export EXTERNAL_IP = [external IP here];
export P2P_PROD_HOST = [IP of prod instance of seed node];
export P2P_PROD_PORT = [MultiChain port of prod instance of seed node];
export P2P_TEST_HOST = [IP of test instance of seed node];
export P2P_TEST_PORT = [MultiChain port of test instance of seed node];
export API_PROD_HOST=[IP of seed API (prod)];
export API_PROD_PORT=[port of seed API (prod)];
export API_TEST_HOST=[IP of seed API (test)];
export API_TEST_PORT=[port of seed API (test)];
```

Navigate into the `blockchain` directory and install the node packages defined in the `package.json` and start the Blockchain with:

```bash
cd blockchain/
npm install
npm start > startup.log 2>&1 &
```

Since you are trying to connect to an already existing Blockchain network the node has to be approved by a master node.
Before the approval, the `startup.log` should look similar to:

```bash
TrubudgetChain http 192.168.96.3 8080 7447 TrubudgetChain@192.168.96.3:7447
>>> Args: -txindex,-port=7447,-autosubscribe=streams,TrubudgetChain@192.168.96.3:7447,,
>> [MULTICHAIN_DIR]/.multichain/TrubudgetChain/multichain.conf rpcport=8000
rpcuser=multichainrpc
rpcpassword=password
rpcallowip=0.0.0.0/0
multichaind  | Retrieving blockchain parameters from the seed node 192.168.96.3:7447 ...
multichaind  | Blockchain successfully initialized.
multichaind  | Please ask blockchain admin or user having activate permission to let you connect and/or transact:
multichaind  | multichain-cli TrubudgetChain grant [redacted] connect
multichaind  | multichain-cli TrubudgetChain grant [redacted] connect,send,receive
multichaind  |
MultiChain 2.0 alpha 2 Daemon (latest protocol 20002)
>>> Multichain stopped. Retry in 10 Seconds...
```

After the node was approved by the master node, the `startup.log` should update to this:

```bash
>> MULTICHAIN_DIR/.multichain/multichain.conf rpcport=8000
rpcuser=multichainrpc
rpcpassword=password
rpcallowip=0.0.0.0/0

TrubudgetChain http 192.168.96.3 8080 7447 TrubudgetChain@192.168.96.3:7447
>>> Args: -txindex,-port=7447,-autosubscribe=streams,TrubudgetChain@192.168.96.3:7447,,
>> MULTICHAIN_DIR/.multichain/TrubudgetChain/multichain.conf rpcport=8000
rpcuser=multichainrpc
rpcpassword=password
rpcallowip=0.0.0.0/0

multichaind  | Retrieving blockchain parameters from the seed node 192.168.96.3:7447 ...
multichaind  | Other nodes can connect to this node using:
multichaind TrubudgetChain@172.17.0.3:7447
This host has multiple IP addresses, so from some networks:
multichaind TrubudgetChain@192.168.96.2:7447
multichaind  | Node ready.
```

## API

If you provisioned a Blockchain of the type "Connect to an existing network" set the following environment parameters:

```bash
export ORGANIZATION="YourOrga" (same as for the Blockchain configuration)
export RPC_HOST=localhost
export RPC_PORT=8000
export ORGANIZATION_VAULT_SECRET=secret
export ROOT_SECRET=root-secret
export RPC_PASSWORD="password"
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

The `api.log` should look similar to:
(the log includes entries from before and after the node is approved by the master node, that's why you see errors here):

```bash
[2018-11-16T15:01:04.019Z] ERROR (TruBudget/5632 on d467a0e3104f): MultiChain connection/permissions not ready yet
[2018-11-16T15:01:09.034Z] INFO (TruBudget/5632 on d467a0e3104f): MultiChain connection established
[2018-11-16T15:01:09.040Z] ERROR (TruBudget/5632 on d467a0e3104f): failed to create organization stream
[2018-11-16T15:01:14.046Z] ERROR (TruBudget/5632 on d467a0e3104f): failed to create organization stream
[2018-11-16T15:01:19.054Z] DEBUG (TruBudget/5632 on d467a0e3104f): Created stream org:YourOrga with options {"kind":"organization","name":"org:YourOrga"}
[2018-11-16T15:01:19.061Z] TRACE (TruBudget/5632 on d467a0e3104f):
    addressFromWallet: "[redacted]"
    privkey: "[redacted]"
[2018-11-16T15:01:19.066Z] TRACE (TruBudget/5632 on d467a0e3104f): wrote hex string to chain: 282 bytes
[2018-11-16T15:01:19.066Z] INFO (TruBudget/5632 on d467a0e3104f): Initializing organization address to local wallet address: [redacted]
[2018-11-16T15:01:19.067Z] DEBUG (TruBudget/5632 on d467a0e3104f): Publishing wallet address to org:YourOrga/"address"
[2018-11-16T15:01:19.069Z] INFO (TruBudget/5632 on d467a0e3104f): organization address: [redacted]
[2018-11-16T15:01:19.072Z] DEBUG (TruBudget/5632 on d467a0e3104f): Created stream users:YourOrga with options {"kind":"users","name":"users:YourOrga"}
[2018-11-16T15:01:19.073Z] INFO (TruBudget/5632 on d467a0e3104f): organization stream present
[2018-11-16T15:01:19.076Z] INFO (TruBudget/5632 on d467a0e3104f): node registered in nodes stream
```

#### Log-Rotation

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
:::danger

Caution: It's possible that nginx was automatically started after installation. To check if this is the case run

```bash
ps aux | grep nginx
```

If you see matching entries, simply run

```bash
nginx -s stop
```

to stop all running processes.
:::
To start the frontend, run the following command:

```bash
/bin/bash configureServer.sh
```

As soon as the step above is done, the frontend should be available on port 80. Make sure that port 80 is exposed and not blocked by any firewall.
