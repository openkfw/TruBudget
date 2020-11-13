# Contributor Guide

This document describes how to set up your environment to start developing and debugging the TruBudget application. The first section describes the recommended tools for development, the second part is dedicated to the installation on your local machine for development and debugging.

## Table of Contents

- [Contributor Guide](#contributor-guide)
  - [Table of Contents](#table-of-contents)
  - [Software components](#software-components)
    - [Docker/Docker-Compose](#dockerdocker-compose)
    - [Node.js / npm](#nodejs--npm)
  - [Clone Repository](#clone-repository)
    - [IDE](#ide)
    - [Chrome Developer Tools](#chrome-developer-tools)
    - [Git-Secrets](#git-secrets)
  - [Developer Setup](#developer-setup)
    - [Blockchain](#blockchain)
      - [Developing on Windows:](#developing-on-windows)
    - [API](#api)
    - [Provisioning (Optional)](#provisioning-optional)
    - [Excel-Export (Optional)](#excel-export-optional)
    - [Frontend](#frontend)
  - [Tests](#tests)
    - [End-to-end Tests](#end-to-end-tests)
    - [Unit Tests](#unit-tests)

## Software components

### Docker/Docker-Compose

The easiest way to setup the application on your machine is via Docker and Docker-Compose. To install these components, please follow the official documentation:

- [Docker](https://docs.docker.com/engine/installation/)
- [Docker Compose](https://docs.docker.com/compose/install/#install-compose)

### Node.js / npm

Follow the official instructions on how to setup [node.js/npm](https://nodejs.org/en/download/)

## Clone Repository

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

#### How to install?

Install git-secrets
Follow the instructions on https://github.com/awslabs/git-secrets#installing-git-secrets or use homebrew to install

```bash
brew install git-secrets
```

#### How to setup?

Setup git-secrets by execute the shell script in the .githooks folder

```bash
cd .githooks
sh setupGitSecrets.sh
```

## Developer Setup

If you want to start developing on Trubudget, you need to setup the application locally. This guide tells you how to start the blockchain, start the API, load up some test data and start the frontend.

### TypeScript

If you are using global installation of TypeScript, please make sure you have at least 4.0.2 version.

### Blockchain

The blockchain works as data layer for the Trubudget application. Therefore, we start by creating an instance of the blockchain.

<br />
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

The API takes care of the communication between the blockchain and the frontend and basically serves as backend. The proper setting of environment variables is crucial, so the API can communicate with the blockchain correctly.

The `/api/src` folder contains README files on each level which describe the layout and architecture of the API. You can start reading [here](https://github.com/openkfw/TruBudget/blob/master/api/src/README.md)

To start the api open your favorite shell, navigate to your api folder and follow these instructions:

```bash
cd ../api
```

1. Set environment variables

- Terminal Mac/Git Bash

```bash
export ORGANIZATION=ACMECorp
export RPC_HOST=127.0.0.1
export RPC_PORT=8000
export PORT=8080
export ROOT_SECRET='asdf'
export ORGANIZATION_VAULT_SECRET="asdf"
export RPC_PASSWORD=s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j
```

- Windows Command Prompt / PowerShell

```bash
SET ORGANIZATION=ACMECorp
SET RPC_HOST=127.0.0.1
SET RPC_PORT=8000
SET PORT=8080
SET ROOT_SECRET='asdf'
SET ORGANIZATION_VAULT_SECRET="asdf"
SET RPC_PASSWORD=s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j
```

2. Install node-modules

- (Linux/Mac) Depending on your machine configuration, it might be necessary to install `autoconf` and `automake`

```bash
brew install autoconf
brew install automake
```

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

### Provisioning (Optional)

This part will initiate the blockchain with test user and project data. The environment variables for this step differ slightly from the ones for the API, so please set them accordingly. You can skip this part if you don't want to have initial test data on your blockchain.

```bash
cd ../provisioning
```

1. Set environment variables

- Terminal Mac/Git Bash

```bash
export API_PORT=8080
export ORGANIZATION=ACMECorp
```

- Windows Command Prompt / PowerShell

```bash
SET API_PORT=8080
SET ORGANIZATION=ACMECorp
SET ROOT_SECRET='asdf'
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

There is a service that exports TruBudget data into an Excel sheet. The service is a node package and needs to be started separately. To start the service, follow these commands:

```bash
cd ../excel-export
```

1. Set environment variables

- Terminal Mac/Git Bash

```bash
export PROD_API_PORT=8080
export TEST_API_PORT=8080
export PROD_API_HOST="localhost"
export TEST_API_HOST="localhost"
export PORT=8888
```

- Windows Command Prompt / PowerShell

```bash
SET PROD_API_PORT=8080
SET TEST_API_PORT=8080
SET PROD_API_HOST="localhost"
SET TEST_API_HOST="localhost"
SET PORT=8888
```

2. Install node-modules

```bash
npm install
```

3. Start the provisioning

```bash
npm start
```

The service is then available either on the host and port set by the environment variable or `localhost:8888` by default.

### Frontend

After initializing the blockchain and api, we can now start the frontend to visualize the data.

Navigate to the frontend folder:

```bash
cd ../frontend
```

1. Set environment variables

- Terminal Mac/Git Bash

```bash
export PORT=3000
```

- Windows Command Prompt / PowerShell

```bash
SET PORT=3000
```

2. Install node-modules

```bash
npm install
```

3. Start the frontend

```bash
npm start
```

The frontend should then be availaible at http://localhost:3000

**Caution**: If you change the port of the api you may have to consider to change the proxy port in the `package.json` accordingly.

**Note**: You do not need to run every project separately if you are developing on a single one. Just do following:
 1. go to a desired folder (e.g. _/api_)
 2. copy `.env.example` file and rename it to `.env`
 3. run ```sh startDev.sh``` in the folder to start dependent project(s)

## Tests

### End-to-end Tests

Before checking in, you should always run the end-to-end test which explores / tests the whole functionality of the application.

```bash
cd frontend
npm install
```

You can either run the tests throught the Cypress Frontend or automatically in the shell. Before that you need to switch into the end to end test folder.

```bash
cd e2e
```

In the `e2e` folder you can run the following commands:

```bash
npm run cypress

or

npm run e2etest
```

If you want your tests to access the frontend under another url you can simply overwrite the baseUrl config through the command line

```bash
npm run cypress -- --config baseUrl=http://localhost:3000 --env API_BASE_URL=http://localhost:8080

or

npm run e2etest -- --config baseUrl=http://localhost:3000 --env API_BASE_URL=http://localhost:8080
```

or through the Cypress frontend under settings

### Unit Tests

Before checking in, you should always create unit tests for the implemented part. For unit testing we use the testing framework [mocha](https://mochajs.org/) with [chai](https://www.chaijs.com/) as assertion library.

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


<!--
| Description           | Link                                                                                                              |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------- |
| How to run e2e-tests? | https://github.com/openkfw/TruBudget/blob/master/doc/wiki/Contributor-Guide/Contributor-Guide.md#end-to-end-tests |
| How to run unit-test? | https://github.com/openkfw/TruBudget/blob/master/doc/wiki/Contributor-Guide/Contributor-Guide.md#unit-tests       |
-->
