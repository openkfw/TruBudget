---
sidebar_position: 2
---

# Setup

This document describes how to set up your environment to start developing and debugging the TruBudget application. If you want to contribute to TruBudget please check out the guidelines in the [CONTRIBUTING.md](https://github.com/openkfw/TruBudget/blob/master/.github/CONTRIBUTING.md).

## Table of Contents

- [Developer Setup](#developer-setup)

  - [Table of Contents](#table-of-contents)

  - [Software components](#software-components)

    - [Working on Windows](#working-on-windows)
    - [Docker/Docker-Compose](#dockerdocker-compose)
    - [Node.js / npm](#nodejs--npm)
    - [Typescript](#typescript)

  - [Project Setup](#project-setup)

    - [Clone Repository](#clone-repository)
    - [IDE](#ide)
    - [Chrome Developer Tools](#chrome-developer-tools)
    - [Git-Secrets](#git-secrets)
    - [Environment variables](#environment-variables)
    - [Docker Environment](#docker-environment)

  - [Development Setup](#development-setup)

    - [Dockerized Application](#dockerized-application)
    - [Blockchain](#blockchain)
    - [API](#api)
    - [Frontend](#frontend)
    - [Provisioning (Optional)](#provisioning-optional)
    - [Excel-Export (Optional)](#excel-export-optional)
    - [Email-Notification (Optional)](#email-notification-optional)
    - [Storage-Service (Optional)](#storage-service-optional)

  - [Tests](#tests)

    - [End-to-end Tests](#end-to-end-tests)
    - [Unit Tests](#unit-tests)

  - [CI/CD](#ci/cd)

  - [Links](#links)

## Software components

### Working on Windows

If you are using a Windows operating system, we suggest using the Windows Subsystem for Linux, for the installation please read [this guide](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly). Because our setup was tested on WSL 1 and not on WSL 2, we suggest using WSL 1. However, if you want to use WSL 2, you can try by following [these steps](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

### Docker/Docker-Compose

The easiest way to setup the application on your machine is via Docker and Docker-Compose. To install these components, please follow the official documentation:

- [Docker](https://docs.docker.com/engine/installation/)
- [Docker Compose](https://docs.docker.com/compose/install/#install-compose)

### Node.js / npm

Follow the official instructions on how to setup [node.js/npm](https://nodejs.org/en/download/).

### TypeScript

If you are using a global installation of TypeScript, please make sure you have a version starting from 4.0.2

## Project Setup

### Clone Repository

Clone the repository from Github:

- SSH:

Follow the instructions on how to setup your [SSH-connection](https://help.github.com/en/articles/connecting-to-github-with-ssh)

```bash
git clone https://github.com/openkfw/TruBudget.git
```

- HTTPS:

```bash
git clone https://github.com/openkfw/TruBudget.git
```

### IDE

For coding, we recommend the use of Visual Studio Code, which you can find [here](https://code.visualstudio.com/).

To ensure that the code is formatted properly we recommend following extensions for VS Code:

- aaron-bond.better-comments

- CoenraadS.bracket-pair-colorizer

- dbaeumer.vscode-eslint

- EditorConfig.EditorConfig

- eg2.tslint

- esbenp.prettier-vscode

- pmneo.tsimporter

- rbbit.typescript-hero

- xabikos.JavaScriptSnippets

- ZeroDragon.prettylintednode

### Chrome Developer Tools

If you are testing and debugging in Google Chrome, we recommend the following extensions:

- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi/related/)

- [Redux Developer Tools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

### Git-Secrets

awslabs/git-secrets is a tool to scan a repository for secrets, credentials or any unwanted text.
We recommend to install git-secrets and setup git-hooks to prevent committing secrets.
The setup-script(.githooks/setupGitSecrets.sh) edits your local git-config located in **.git**.
Changes made by setupGitSecrets.sh:

- change hooks-path to .githooks
- adds git-secrets-patterns listed in .githooks/git-secrets-patterns

#### How to install git-secrets?

Follow the instructions [here](https://github.com/awslabs/git-secrets#installing-git-secrets) or use homebrew

```bash
brew install git-secrets
```

#### How to setup?

Setup git-secrets by execute the shell script in the .githooks folder

```bash
cd .githooks
sh setupGitSecrets.sh
```

### Environment variables

All projects in TruBudget (blockchain, api, frontend, etc) have a docker-compose file that can be used to start the project with. In order to start the projects, some environment variables must be set. In order to make this easier, there are some files containing the environment variables called `.env_example` in each project directory. To use these environemnt variables, simply copy the `.env.example` file and rename it to `.env`.
:::note
Do **NOT** use other additional ways to set environment variables like inline env-variables or env-variables defined by 'export'. Why? - Because these env-variables will overwrite each which makes it very hard to find mistakes.
:::

### Docker Environment

There is a folder called `docker-compose` in the root project directory. Running the project from these files is also possible, however check out the [README.md](https://github.com/openkfw/TruBudget/blob/master/docker-compose/README.md) for more details.

## Development Setup

If you want to start developing on Trubudget, you need to setup the application locally. This guide tells you how to start the blockchain, start the API, load up some test data and start the frontend.

### Dockerized Application

This is the fastes way you can run all services needed for development. Everything is run in one command:

1.  in root directory execute: `sh scripts/development/start-dev.sh`

The script cares for `.env` file. No further step needed.

Following services are dockerized:

- Blockchain (master node)
- API (master API)
- Provisioning (feeds application with dummy data)
- Excel export
- Frontend

It takes some time to build and run at the first launch. After that, source codes of API and frontend are live reloaded. That means any change in `./src` folder is reflected in respective containter automatically.

The frontend should be availaible as usual at http://localhost:3000

Docker Compose ensures that services are communicating and have correct environment variables set. Docker Compose puts all services in the same network and exposes needed ports.

You can inspect each container individually: `docker logs --follow CONTAINER`. Where _CONTAINER_ represents selected value of NAMES column container in output of `docker ps` command.

### Blockchain

The blockchain works as data layer for the Trubudget application. We suggest reading the [README.md](https://github.com/openkfw/TruBudget/tree/master/blockchain/README.md) file in the `/blockchain` to have a better idea on how the blockchain layer works in TruBudget. Also, take a look at the [multichain] website to see how the multichain works.

We start by creating an instance of the blockchain.

First, navigate to the `/blockchain` folder, install all the npm packages and then start the blockchain via a shellscript:

1. Navigate to the ./blockchain folder and start your favourite shell.

```bash
cd blockchain
```

2. Start docker if it is not running already

3. Install node-modules

```bash
npm install
```

4. Create a blockchain instance

```bash
sh startDev.sh
```

#### Developing on Windows:

If you are developing on Windows, we recommend using the Git Bash to run the `startDev.sh` script.

### API

The API takes care of the communication between the blockchain and the frontend and basically serves as backend.
The API is developed using [Node.js], with [Fastify], [Axios], [Joi]
The proper setting of environment variables is important so the API can communicate with the blockchain correctly. Details regarding the environment variables can be found [here](https://github.com/openkfw/TruBudget/blob/master/api/README.md).

The API is structured into layers (application layer, service layer, domain layer) and each of these layers has its own language. There is a README file in each of the layers, where the structure of the API and the current layer is described in detail. You can start by checking out this [link](https://github.com/openkfw/TruBudget/blob/master/api/src/README.md) to get more details.

To start the api open your favorite shell, navigate to your api folder and follow these instructions:

```bash
cd ../api
```

1. Set environment variables

- Rename the .env_example file to .env and set following environment variables accordingly.

```bash
ORGANIZATION=ACMECorp
RPC_HOST=127.0.0.1
RPC_PORT=8000
PORT=8080
ROOT_SECRET='root-secret'
ORGANIZATION_VAULT_SECRET="secret"
RPC_PASSWORD=s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j
```

2. Install node-modules

- (Linux/Mac) Depending on your machine configuration, it might be necessary to install `autoconf` and `automake`

```bash
brew install autoconf
brew install automake
```

- Terminal Mac/Git Bash

```bash
npm install
```

3. Start the api

_On Linux/Mac_:

```bash
npm run dev
```

_On Windows_:
Unfortunately hot reloading using nodemon is currently not working properly on Windows. It's therefore recommended to open two open 2 separate terminal windows. Navigate to the api folder and set the environment variables as described above. Make sure that the above environment variables are set in both terminal windows.
In the first terminal window run

```bash
tsc --watch
```

In the second window run

```bash
npm install -g nodemon
nodemon dist
```

to start the api.

The API-Documentation should then be available at http://localhost:8080/api/documentation/index.html

#### Using Postman

One tool that can be used for REST calls is called [Postman](https://www.getpostman.com/). There is a [collection of API calls](https://github.com/openkfw/TruBudget/blob/master/api/postman/TruBudget.postman_collection.json) ready to be imported into Postman.

### Frontend

After initializing the blockchain and api, we can now start the frontend to visualize the data. For developing the frontend we use [React], along with the [Redux-Saga] library and the [Material-UI] framework. You can check out the [README.md](https://github.com/openkfw/TruBudget/blob/master/frontend/README.md) for more details about the frontend.

Navigate to the frontend folder:

```bash
cd ../frontend
```

1. Set environment variables

- Rename the .env_example file to .env and set following environment variables accordingly.

```bash
PORT=3000
```

**Additionally** you can connect the frontend to the optional excel export service, by adding the environment variables mentioned in the excel-export section of the [README.md](https://github.com/openkfw/TruBudget/blob/master/frontend/README.md#Excel-Export-Service)

2. Install node-modules

```bash
npm install
```

3. Start the frontend

```bash
npm start
```

The frontend should then be availaible at http://localhost:3000

:::caution
If you change the port of the api you may have to consider to change the proxy port in the `package.json` accordingly.
:::

:::note
You do not need to run every project separately if you are developing on a single one. Just do following:

1. go to a desired folder (e.g. _/api_)
2. copy `.env.example` file and rename it to `.env`
3. run `sh startDev.sh` in the folder to start dependent project(s)

:::

### Provisioning (Optional)

This part will initiate the blockchain with test user and project data. The environment variables for this step differ slightly from the ones for the API, so please set them accordingly. You can skip this part if you don't want to have initial test data on your blockchain. Check out the [README.md](https://github.com/openkfw/TruBudget/blob/master/provisioning/README.md) for more details.

```bash
cd ../provisioning
```

1. Set environment variables

- Rename the .env_example file to .env and set following environment variables accordingly.

```bash
API_PORT=8080
ORGANIZATION=ACMECorp
ROOT_SECRET='root-secret'
```

2. Install node-modules

```bash
npm install
```

3. Start the provisioning

```bash
npm start
```

### Excel-Export (Optional)

There is a service that exports TruBudget data into an Excel sheet. For exporting we use the npm package [exceljs].
The service is a node package and needs to be started separately. More details regarding the excel-export service can be found in the [README.md](https://github.com/openkfw/TruBudget/blob/master/excel-export-service/README.md).

To start the service locally, follow these commands:

```bash
cd ../excel-export-service
```

1. Set environment variables

- Rename the .env_example file to .env and set following environment variables accordingly.

```bash
PROD_API_PORT=8080
TEST_API_PORT=8080
PROD_API_HOST="localhost"
TEST_API_HOST="localhost"
PORT=8888
```

2. Install node-modules

```bash
npm install
```

3. Start the service

```bash
npm start
```

The service is then available either on the host and port set by the environment variable or `localhost:8888` by default.

:::note
in order to access the excel export service from the UI, you should start the frontend with some additional environment variables as mentioned in the excel-export section of the [frontend README.md](https://github.com/openkfw/TruBudget/blob/master/frontend/README.md#Excel-Export-Service) file.
:::

:::note
Another way to start the excel export service is in a docker container. Using the docker-compose file in the excel-export folder will build the whole application including api, blockchain, frontend and excel-export service at the same time.
:::

### Email-Notification (Optional)

The email notification service is responsible for saving/deleting email adresses per Trubudget user in a connected database. These email addresses are used to send configurable notifications to a connected SMTP server.

If you want to start this service or simply see more details regarding this feature you can check out the [README.md](https://github.com/openkfw/TruBudget/blob/master/email-notification-service/README.md) file.

### Storage-Service (Optional)

The storage service is responsible for saving/accessing documents to Minio, an external storage server.

More details and how to enable the storage service with an external storage can be found in [README.md](https://github.com/openkfw/TruBudget/blob/master/storage-service/README.md) file.

## Tests

### End-to-end Tests

Before checking in, you should always run the end-to-end test which explores / tests the whole functionality of the application. For end-to-end testing we use the testing framework [Cypress]. If you want to start all e2e-tests to check if your changes are not breaking any stuff we recommend the [Docker Compose Setup](#docker-compose-setup). More details regarding the environment variables can be found in the [README.md](https://github.com/openkfw/TruBudget/blob/master/e2e-test/README.md) file.

#### Docker-Compose Setup

One way to start the all end-to-end tests is starting the e2e-test script. To start them execute following commands from root directory to make sure e2e-test will work:

```bash
cp .env_example .env
sed -i 's/ORGANIZATION=.*/ORGANIZATION=KfW/g' .env
sh scripts/testing/start-all-e2e-tests.sh
```

:::note
The organization has to be "KfW" because the e2e-test's Organization is still hardcoded.
:::

More information about the docker compose setup can be found in the e2e-test [README.md](https://github.com/openkfw/TruBudget/blob/master/e2e-test/README.md) file.

#### Prerequisits

Before running the tests you should make sure that the application is started (including the [excel export service](#excel-export-optional)) and that you first run the [provisioning](#provisioning-optional). In order for the backup_spec tests to pass you should also start the project with the same configurations (Organization and RPC Password). When running the e2e-tests locally, you have to make sure that the password used for authentication as root user in the test matches the one used in the project that is currently running, otherwise some tests can fail because of an "Authentication failed" error.

#### Setup

```bash
cd frontend
npm install
```

You can either run the tests throught the Cypress Frontend or automatically in the shell. Before that you need to switch into the end to end test folder.

```bash
cd e2e-test
```

In the `e2e-test` folder you can run the following commands:

Before you run cypress, you need to specify the environment variables (such as Organization, URLs of fronted, api, excel export, email service) in the .env\* file. If you have not .env\* file, create one and copy the content from /e2e-test/.env_example\* to /e2e-test/.env\*. For more information see [Environment variables](#environment-variables)

```bash
npm run cypress

or

npm run e2etest

```

or through the Cypress frontend under settings.

For further information see the [README.md](https://github.com/openkfw/TruBudget/blob/master/e2e-test/README.md) of /e2e-test

:::note
The .env file is needed.
:::

### Unit Tests

Before checking in, you should always create unit tests for the implemented part. For unit testing we use the testing framework [Mocha] with [Chai] as assertion library.

Following command executes all spec.js files in the src folder:

```bash
cd api
npm run test
```

Following command executes all spec.js files in a specific folder (e.g. project) located in the src folder:

```bash
cd api
npm run test:here <folderName>
```

Following command executes a specific test group (e.g. "Updating a project") defined within spec.js files in a specific folder (e.g. project) located in the src folder. The test group is defined with the describe function of mocha.

```bash
cd api
npm run test:here <folderName> <describeString>
```

### CI/CD

The CI/CD is described [here](https://github.com/openkfw/TruBudget/tree/master/.github/workflows/README.md)

## Links

Here you can find a summary of all the technologies used in TruBudget with links to their websites and documentation

### Blockchain

- [README.md](https://github.com/openkfw/TruBudget/blob/master/blockchain/README.md)
- [Multichain](https://www.multichain.com/developers/)
- [Multichain-CLI tutorial](https://github.com/openkfw/TruBudget/blob/master/doc/tutorials/multichain-cli/multichain-cli.md)

### API

- [README.md](https://github.com/openkfw/TruBudget/blob/master/api/README.md)
- [Node.js]
- [Fastify]
- [Axios]
- [Joi]

### Frontend

- [README.md](https://github.com/openkfw/TruBudget/blob/master/frontend/README.md)
- [React]
- [Redux-Saga]
- [Material-UI]

### Provisioning

- [README.md](https://github.com/openkfw/TruBudget/blob/master/provisioning/README.md)

### Excel-Export

- [README.md](https://github.com/openkfw/TruBudget/blob/master/excel-export-service/README.md)
- [Exceljs]

### E2E-Tests

- [README.md](https://github.com/openkfw/TruBudget/blob/master/e2e-test/README.md)
- [Cypress]

### Unit-Tests

- [Mocha]
- [Chai]

<!-- Links -->

[multichain]: https://www.multichain.com/developers/
[node.js]: https://nodejs.org/en/docs/
[fastify]: https://www.fastify.io/docs/latest/
[axios]: https://github.com/axios/axios
[joi]: https://github.com/sideway/joi
[postman]: https://www.postman.com/downloads/
[react]: https://reactjs.org/docs/getting-started.html
[redux-saga]: https://redux-saga.js.org/
[material-ui]: https://material-ui.com/
[exceljs]: https://github.com/exceljs/exceljs
[cypress]: https://docs.cypress.io/
[mocha]: https://mochajs.org/
[chai]: https://www.chaijs.com/

<!--
| Description           | Link                                                                                                              |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------- |
| How to run e2e-tests? | https://github.com/openkfw/TruBudget/blob/master/doc/wiki/Contributor-Guide/Contributor-Guide.md#end-to-end-tests |
| How to run unit-test? | https://github.com/openkfw/TruBudget/blob/master/doc/wiki/Contributor-Guide/Contributor-Guide.md#unit-tests       |
-->
