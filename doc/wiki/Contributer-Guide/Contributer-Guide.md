# Contributer Guide

This document describes how to set up your environment to start developing and debugging the TruBudget application. The first section describes the recommended tools for development, the second part is dedicated to the installation on your local machine for development and debugging.

## Software components

### Docker/Docker-Compose

The easiest way to setup the application on your machine is via Docker and Docker-Compose. To install these components, please follow the official documentation:

- [Docker](https://docs.docker.com/engine/installation/)
- [Docker Compose](https://docs.docker.com/compose/install/#install-compose)

### Node.js / npm

Follow the official instructions on how to setup [node.js/npm](https://nodejs.org/en/download/)

## Clone gitlab repository

Clone the repository from Gitlab:

- SSH:

```bash
git clone https://github.com/openkfw/TruBudget.git
```

Follow the instructions on how to setup your [SSH-connection](https://docs.gitlab.com/ee/ssh/)

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

<!-- ## Software-architecture

That should be an image of the software architecture of Trubudget

![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Software Architecture Trubudget")

frontend <-> api <-> blockchain -->

## Developer Setup

If you want to start developing on Trubudget, you need to setup the application locally. This guide tells you how to start the blockchain, start the API, load up some test data and start the frontend.

### Blockchain

The blockchain works as data layer for the Trubudget application. Therefore, we start by creating an instance of the blockchain. To login to the docker registry, obtain a password from one of the administrators and then save it to `DOCKER_REGISTRY_PASSWORD`

<br />
First, navigate to the `/blockchain` folder, install all the npm packages and then start the blockchain via a shellscript:

1. Navigate to the trubudget-app/blockchain folder and start your favourite shell.

```bash
cd blockchain
```

2. Save the password to the docker registry in the file `DOCKER_REGISTRY_PASSWORD` (the value 'password' below is just an example)

```bash
echo 'password' > DOCKER_REGISTRY_PASSWORD
```

Alternatively, login to the docker registry via

```bash
docker login http://index.docker.io -u username -p password
```

To obtain the password to the docker registry, please contact one of the administrators.

3. Start docker if it is not running already

4. Install node-modules

```bash
npm install
```

5. Create a blockchain instance

```bash
sh startDev.sh
```

#### Developing on Windows:

If you are developing on Windows, we recommend using the Git Bash to run the `startDev.sh` script.

### API

The API takes care of the communication between the blockchain and the frontend and basically serves as backend. The proper setting of environment variables is crucial, so the API can communicate with the blockchain correctly.

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
```

- Windows Command Prompt / PowerShell

```bash
SET ORGANIZATION=ACMECorp
SET RPC_HOST=127.0.0.1
SET RPC_PORT=8000
SET PORT=8080
SET ROOT_SECRET='asdf'
SET ORGANIZATION_VAULT_SECRET="asdf"
```

2. Install node-modules

```bash
npm install
```

3. Start the api

_On Linux/Mac_:

```bash
npm run dev
```

_On Windows_:
Unfortunately hot reloading using nodemon is currently not working properly on Windows. It's therefore recommended to open two open 2 separate terminal windows. Navigate to the api folder and set the environment variables as described above.
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

The API-Documentation should then be available at http://localhost:8080/api/documentation

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
SET API_PORT = 8080
SET ORGANIZATION = ACMECorp
```

2. Install node-modules

```bash
npm install
```

3. Start the provisioning

```bash
npm start
```

### Frontend

After initializing the blockchain and api, we can now start the frontend to visualize the data.

Navigate to the frontend folder:

```bash
cd ../frontend
```

1. Install node-modules

```bash
npm install
```

2. Start the frontend

```bash
npm start
```

The frontend should then be availaible at http://localhost:3000

**Caution**: If you change the port of the api you may have to consider to change the proxy port in the `package.json` accordingly.

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
