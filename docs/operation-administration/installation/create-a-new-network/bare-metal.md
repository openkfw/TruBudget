# Create a new Network on a Machine

**It is highly recommended to use the [Docker-Compose Setup guide](./docker.md) instead of this Setup guide. Only use
this guide if docker cannot be used**

This guide describes how to create a new network without the use of Docker, Docker-Compose.
Before starting make sure to have `node`,`npm` and
the [latest release of MultiChain](https://www.multichain.com/download-community/) available on your machine.
To check if all required tools are installed correctly use following check commands:

- node: `node -v`
- npm: `npm -v`
- multichain: `multichain-util` & `multichaind`

If the above commands cannot be found make sure the tools are installed and the PATH variables are set correctly.

## Table of Contents

- [Create a new Network on a Machine](#create-a-new-network-on-a-machine)
  - [Table of Contents](#table-of-contents)
  - [Get the repository](#get-the-repository)
  - [Blockchain](#blockchain)
  - [API](#api)
  - [Frontend](#frontend)
    - [Direct Connect](#direct-connect)
    - [Reverse Proxy (nginx)](#reverse-proxy-nginx)
      - [Adding a TruBudget Service to the reverse proxy](#adding-a-trubudget-service-to-the-reverse-proxy)
  - [Provisioning](#provisioning)
  - [Excel-Export Service](#excel-export-service)
    - [Frontend](#frontend-1)
  - [Email-Notification Service](#email-notification-service)
    - [Service](#service)
    - [Database](#database)
    - [SMTP-Server](#smtp-server)
    - [Frontend](#frontend-2)
    - [Blockchain](#blockchain-1)
  - [Storage Service](#storage-service)
    - [Service](#service-1)
    - [Storage](#storage)
    - [API](#api-1)
  - [Log-Rotation](#log-rotation)

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

Set the environment parameters listed below:

```bash
export PORT=8085
export P2P_PORT=7447
export MULTICHAIN_RPC_PORT=8000
export MULTICHAIN_RPC_USER="multichainrpc"
export MULTICHAIN_RPC_PASSWORD="password"
export MULTICHAIN_DIR="/tmp"
export PRETTY_PRINT="true"
```

:::hint
Use absolute paths for environment variables.
If it's not the first start and the `.multichain` folder exists already a multichain error will be shown in the logs but
multichain will work as expected.
(Error while creating Multichain
err: "ERROR: Blockchain parameter set was not generated.\n" )
:::

Navigate into the `blockchain` directory, install the node packages defined in the `package.json` and start the
blockchain using following lines:

```bash
cd blockchain/
npm install
npm start
```

:::hint
To run the process as background process use `npm start > blockchain.log 2>&1 &`, the blockchain.log contains the logs
of the blockchain process
:::

If the logs are showing the line `Node ready` the node is setup correctly.
The blockchain can be checked by HTTP-Request `localhost:8085/version` using postman, curl or even a browser. The
response is the current version of TruBudget's blockchain.

## API

Set the environment parameters listed below:

```bash
export ORGANIZATION=MyOrga
export P2P_PORT=7447
export MULTICHAIN_RPC_PORT=8000
export PORT=8080
export MULTICHAIN_RPC_HOST=127.0.0.1
export MULTICHAIN_RPC_USER="multichainrpc"
export MULTICHAIN_RPC_PASSWORD="password"
export ORGANIZATION_VAULT_SECRET=secret
export ROOT_SECRET=root-secret
export PRETTY_PRINT="true"
export NODE_ENV="development"
export JWT_SECRET="jwt-secret"
```

Navigate into the `api` directory, install the node packages defined in the `package.json` and start the api using
following lines:

```bash
cd api/
npm install
npm run build
npm start
```

:::hint
To run the process as background process use `npm start > api.log 2>&1 &`, the api.log contains the logs of the api
process
:::

If the logs are showing the line `Node 1ad358tnuTvQd9WpHQLPXmrYt9SeppiwPQNgNL registered`
and `Keys successfully published` the api is setup correctly.
The api can be checked by HTTP-Request `localhost:8080/api/readiness` using postman, curl or even a browser. The
response should be `OK`.

## Frontend

There are two ways of starting the frontend using different networking solutions:

- Direct connect
- Reverse proxy (nginx)

### Direct Connect

The environment parameters `API_HOST` and `API_PORT` are not used by the frontend direct connect setup, to connect to
the api the `package.json` has to be adapted.
Use the property `proxy` to pass the API connection "proxy": "http://API_HOST:API_PORT". (e.g. "
proxy": "http://20.11.202.22:8080")

Navigate into the `frontend` directory, install the node packages defined in the `package.json` and start the frontend
using following lines:

```bash
cd frontend/
npm install
npm start
```

### Reverse Proxy (nginx)

Make sure you have installed nginx on your
machine: [nginx installation](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)

With following commands packages are installed, the frontend is built and copied into the folder of nginx, the nginx
config is copied into your nginx installation and the frontend is started:

```bash
cd frontend/
npm install
npm run build
cp -R build/* /usr/share/nginx/html
cp nginx.conf /etc/nginx/conf.d/default.conf
/bin/bash configureServer.sh
```

Nginx' configuration is all about the `default.conf` file which is dynamically adapted
by `./frontend/configureServer.sh`.
If any configuration regarding nginx must be made e.g. ssl configuration start at our `default.conf`
templates `nginx.conf`, `nginx-ssl.conf` or use nginx' example nginx.conf in
their [official documentation](https://www.nginx.com/resources/wiki/start/topics/examples/full/#nginx-conf)

:::hint
Make sure that port 80 is available for nginx. This can be changed in the nginx.conf.
Check out [configureServer.sh](https://github.com/openkfw/TruBudget/blob/main/frontend/configureServer.sh) to configure
all proxy passes.
To run the process as background process use `/bin/bash configureServer.sh > frontend.log 2>&1 &`, the frontend.log
contains the logs of the frontend process
:::

As soon as the step above is done, the frontend should be available on port 80 (default port of nginx in `default.conf`)
.
Additionally the api can be reached via nginx reverse proxy at `localhost/test/api/readiness`

#### Adding a TruBudget Service to the reverse proxy

The configuration of the nginx proxy is done with `configureServer.sh` by using the same environment variables used in
the rest of the bare-metal guide.
For e.g. the excel-export-service the environment list of the frontend must be applied to the shell where nginx proxy
will be started.
Then the script `configureServer.sh` will adapt your `/etc/nginx/conf.d/default.conf` according to the environment
variables set in the shell.
For detailed information check out the
script [configureServer.sh](https://github.com/openkfw/TruBudget/blob/main/frontend/configureServer.sh)

## Provisioning

The Provisioning generates test-data via TruBudget's API.

Set the environment parameters listed below:

```bash
export API_PORT=8080
export ORGANIZATION=MyOrga
export ROOT_SECRET=root-secret
export PRETTY_PRINT="true"
```

Navigate into the `provisioning` directory, install the node packages defined in the `package.json` and start the
provisioning using following lines:

```bash
cd provisioning/
npm install
npm start
```

:::hint
Make sure the api is started in development mode (NODE_ENV=development), otherwise the api validations won't accept the
user creation of the provisioning
To run the process as background process use `npm start > provisioning.log 2>&1 &`, the provisioning.log contains the
logs of the provisioning process
:::

To test if the provisioning worked, login with credentials:

- username: mstein
- password: test

## Excel-Export Service

Set the environment parameters listed below:

```bash
export API_HOST=127.0.0.1
export API_PORT=8080
export PORT=8888
export ACCESS_CONTROL_ALLOW_ORIGIN="*"
export PRETTY_PRINT="true"
```

Navigate into the `excel-export-service` directory, install the node packages defined in the `package.json` and start
the excel-export-service using following lines:

```bash
cd excel-export-service/
npm install
npm run build
npm start
```

:::hint
To run the process as background process use `npm start > excel-export.log 2>&1 &`, the excel-export.log contains the
logs of the excel-export process
:::

### Frontend

To enable the excel-export-service additional environment variables must be provided to the `frontend`.
Make sure the following lines adapt the environment of the frontend NOT the excel-export-service:

```bash
export REACT_APP_EXPORT_SERVICE_ENABLED=true
export EXPORT_HOST=localhost
export EXPORT_PORT=8888
```

To test if the setup is working correctly, click the export button in Trubudget's frontend. If the button doesn't show
up check all related environment variables again and try to re-login.

## Email-Notification Service

The email-notification-service consists of two components:

- email-service - provides an API to insert/update/delete email data
- database - provides a postgres database where email data can be stored

### Service

Set the environment parameters listed below:

```bash
export PORT=8890
export ACCESS_CONTROL_ALLOW_ORIGIN="*"
export PRETTY_PRINT="true"
export JWT_SECRET="jwt-secret"
export DB_TYPE="pg"
export DB_NAME="trubudget_email_service"
export DB_USER="postgres"
export DB_PASSWORD="test"
export DB_HOST="localhost"
export DB_PORT="5432"

```

Navigate into the `email-notification-service` directory, install the node packages defined in the `package.json` and
start the email-notification-service using following lines:

```bash
cd email-notification-service/
npm install
npm run build
npm start
```

:::hint
To run the process as background process use `npm start > email-notification.log 2>&1 &`, the email-notification.log
contains the logs of the email-notification process
:::

### Database

For the email-notification-service a database is needed. In this section postgres is used. To create a postgres database
follow a guide on [postgres' official website](https://www.postgresql.org/download/).
Make sure you install postgres create a user role and a database.
Provide the information to the email-service via environment variables.

### SMTP-Server

To actually send emails a running SMTP-server must be connected to the email-service. To test the setup with a local
test SMTP mock check and try out [mailslurper](https://github.com/mailslurper/mailslurper).
Use the [environment variables](../../../environment-variables.md) prefixed with SMTP of the email-service to connect
the service to your SMTP-server.

### Frontend

To enable the email-notification-service additional environment variables must be provided to the `frontend`.
Make sure the following lines adapt the environment of the frontend NOT the excel-export-service:

```bash
export REACT_APP_EMAIL_SERVICE_ENABLED=true
export EMAIL_HOST=localhost
export EMAIL_PORT=8890
```

### Blockchain

To enable the email-notification-service additional environment variables must be provided to the `blockchain`.
Make sure the following lines adapt the environment of the blockchain NOT the excel-export-service:

```bash
export EMAIL_SERVICE_ENABLED=true
export EMAIL_HOST=localhost
export EMAIL_PORT=8890
export JWT_SECRET="jwt-secret"
```

:::hint
If the multichain-feed file hasn't execute permissions already following warning will be displayed in the blockchain
logs:
`feed: "sh: 1: [Path-to-Trubudget]/TruBudget/blockchain/src/multichain-feed/multichain-feed: Permission denied\n"`.
Grant the file execute
permissions: `chmod +x [Path-to-Trubudget]/TruBudget/blockchain/src/multichain-feed/multichain-feed`
:::

To test if the setup is working correctly, open the side menu in Trubudget's frontend and open the user's profile by
clicking the settings button next to the username.
In the profile setting dialog edit the email address of the user and check if the user can be inserted into your
database.
If the email field doesn't show up check all related environment variables again and try to re-login.

## Storage Service

The storage-service consists of two components:

- storage-service - provides an API to insert/delete files
- S3-storage - provides a S3 storage where files can be stored

### Service

Set the environment parameters listed below:

```bash
export PRETTY_PRINT="true"
export ACCESS_CONTROL_ALLOW_ORIGIN="*"
export STORAGE_SERVICE_PORT=8090
export MINIO_ACCESS_KEY="minio"
export MINIO_SECRET_KEY="minio123"
export MINIO_PORT=9000
export MINIO_HOST="localhost"
export MINIO_BUCKET_NAME="trubudget"
```

Navigate into the `storage-service` directory, install the node packages defined in the `package.json` and start the
storage-service using following lines:

```bash
cd storage-service/
npm install
npm run build
npm start
```

:::hint
To run the process as background process use `npm start > email-notification.log 2>&1 &`, the email-notification.log
contains the logs of the email-notification process.
Without a running S3 storage the storage-service will throw errors constantly trying to connect to one.
:::

### Storage

We recommend to use Minio as S3 storage. To start Minio without docker we refer to
their [official documentation](https://docs.min.io/docs/minio-quickstart-guide.html).
Provide the information to the storage-service via [environment variables](../../../environment-variables.md).

### API

To enable the storage-service additional environment variables must be provided to the `api`.
Make sure the following lines adapt the environment of the api NOT the storage-service:

```bash
export DOCUMENT_FEATURE_ENABLED=true
export STORAGE_SERVICE_HOST=localhost
export STORAGE_SERVICE_PORT=8090
export STORAGE_SERVICE_EXTERNAL_URL="localhost:8090"
```

To test if the setup is working correctly, create a new workflowitem in Trubudget's frontend and add a document during
the creation process.
In minio usually available at `localhost:9000` the storage can be checked after login in with the MINIO_ACCESS_KEY and
MINIO_SECRET_KEY.
If the document doesn't show up at the minio dashboard check all related environment variables again.
The document-download can be checked via workflowitem info button.

## Log-Rotation

As stated above in the hint sections, the logs can be printed to files like `api.log`. For operational purposes it is
useful to have an application that manages the logs and takes care of log rotation (i.e. breaking the logs into smaller
chunks). Luckily, there are several applications that are capable of doing exactly that. One of them is PM2, which we
will describe here shortly.

PM2 is an application that handles node processes for you and restarts it after a crash. PM2 can be installed via the
following command

```bash
npm install -g pm2
```

It offers a wide range of plugins called "Modules" that can be installed via PM2 directly. One of these modules is
called "pm2-logrotate" which can be used to rotate logs (e.g. split them into chunks of certain size or create separate
files for each day) and the command to install it is simply

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
