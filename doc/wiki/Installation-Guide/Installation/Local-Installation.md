# Local Installation - Debian/Ubuntu/Fedora

The following section describes how to setup TruBudget on Debian/Ubuntu/Fedora machines.
This guide will setup the following components:

- **Blockchain**: a MultiChain Blockchain node
- **API**: a microservice serving as interface to connect to the Blockchain
- **Frontend**: a web application connected to the API displaying the data of the Blockchain

If you decide to use more than one virtual machines, execute the commands only on the machine where the component is supposed to run.

## Prepare

### Install software

Execute the following commands as administrator to install Node.js, Multichain, curl, nginx and git:

Debian/Ubuntu:

```bash
sudo su
apt-get update

apt-get install -y wget git nginx curl && curl -sL https://deb.nodesource.com/setup_9.x | bash - && apt-get install -y nodejs \
    && cd /tmp \
    && wget --no-check-certificate https://www.multichain.com/download/multichain-2.0-alpha-6.tar.gz\
    && tar -xvzf multichain-2.0-alpha-6.tar.gz \
    && cd multichain-2.0-alpha-6 \
    && mv multichaind multichain-cli multichain-util /usr/bin \
    && cd /tmp \
    && rm -Rf multichain* \
    && apt-get clean \
    && cd
```

Fedora:

```bash
yum install -y wget git nginx curl && curl --silent --location https://rpm.nodesource.com/setup_8.x | bash - && yum install -y nodejs \
    && cd /tmp \
    && wget --no-check-certificate https://www.multichain.com/download/multichain-2.0-alpha-6.tar.gz\
    && tar -xvzf multichain-2.0-alpha-6.tar.gz \
    && cd multichain-2.0-alpha-6 \
    && mv multichaind multichain-cli multichain-util /usr/bin \
    && cd /tmp \
    && rm -Rf multichain* \
    && cd
```

### Get the repository

Clone the gitlab repositories of the components onto the designated machines.

Clone the repository:

```
git clone https://github.com/openkfw/TruBudget.git
cd TruBudget
```

If you work with an existing checkout, make sure you have the latest changes:

```
git pull
```

## Blockchain

Set the following environment variables to deploy a new Blockchain network:

```bash
export P2P_PORT=7447
export RPC_PORT=8000
export RPC_USER="multichainrpc"
export RPC_PASSWORD="password"
export RPC_ALLOW_IP=0.0.0.0/0.0.0.0
export MULTICHAIN_DIR="/root"
```

To connect to an already existing Blockchain network **adapt** and set the following environment parameters:

```bash
export ORGANIZATION="YourOrga";
export RPC_PORT=8000;
export RPC_USER="multichainrpc";
export RPC_PASSWORD="password";
export RPC_ALLOW_IP="0.0.0.0/0";
export MULTICHAIN_DIR="/root"
export EXTERNAL_IP = [external IP here];
export P2P_HOST = [IP of seed node];
export P2P_PORT = [MultiChain port of seed node];

export API_PROTO="http";
export API_HOST=[IP of seed API];
export API_PORT=[port of seed API];
```

where

- P2P_HOST / P2P_PORT contains the IP and port where the MultiChain of the master node can be reached
- API_HOST / API_PORT contains the IP and port where the API of the master node can be reached
- EXTERNAL_IP: The public IP address of the slave node

Navigate into the `blockchain` directory and install the node packages defined in the `package.json` and start the Blockchain with:

```bash
cd blockchain/
npm install
npm start > startup.log 2>&1 &
```

If you have decided to create a new Blockchain network the information within `startup.log` should look similar to:

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

If you decided to connect to an already existing Blockchain network the node has to be approved by a master node.
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

If you have decided to provision a new Blockchain network **adapt** and set the environment parameters listed below on the machine:

```bash
export ORGANIZATION="MyOrga"
export P2P_PORT=7447
export RPC_PORT=8000
export PORT=8080
export RPC_HOST=127.0.0.1
export RPC_USER="multichainrpc"
export RPC_PASSWORD="password"
export ORGANIZATION_VAULT_SECRET="asdf"
export ROOT_SECRET="asdf"
```

If you provisioned a Blockchain of the type "Connect to an existing network" set the following environment parameters:

```bash
export ORGANIZATION="YourOrga" (same as for the Blockchain configuration)
export RPC_HOST=localhost
export RPC_PORT=8000
export ORGANIZATION_VAULT_SECRET=test
export ROOT_SECRET=test
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

The `api.log` of the type "Connect to an existing network" should look similar to
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

### Provisioning

The Provisioning fills the blockchain with test-data.
To start the provisioning, open your favorite shell, navigate to your provisioning folder and follow these instructions:

```bash
cd ../provisioning
```

#### 1. Set environment variables

"API_PORT", "ROOT_SECRET" and "ORGANIZATION" variables have to be the same as when starting the api.

- Terminal Mac/Git Bash

```bash
export API_PORT=8080
export ORGANIZATION="MyOrga"
export ROOT_SECRET=test
```

- Terminal Windows/Command Shell

```bash
SET API_PORT = 8080
SET ORGANIZATION = "MyOrga"
SET ROOT_SECRET = test
```

#### 2. Install node-modules

```
npm install
```

#### 3. Start the provisioning

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

As soon as the step above is done, the frontend should be available on port 80. Make sure that port 80 is exposed and not blocked by any firewall.

## Known Issues

For the solution to known issues, please see the [Known Issues page](Known-Issues.md).
