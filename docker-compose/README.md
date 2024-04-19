# Docker Compose

Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application’s services. Then, with a single command, you create and start all the services from your configuration. To learn more about Compose and how to install it visit the [official docker website](https://docs.docker.com/compose/).

## docker-compose vs docker compose (v2)

Following guide is using the recommended command `docker compose` (v2).

## Environment Variables

Environment variables for each service can be checked in the individual service `README.md` files.
All environment variables are configured via `.env` file. The `.env.example` file can be used as first configuration by copying it to `.env` file:

```
cp .env_example .env
```

All variables in the `.env` file are passed to one or more TruBudget docker compose services per default, if another .env file should be used the `--env-file` option can be used.
The mapping of .env environment variables and docker compose container variables can be checked in the used docker-compose.yml file/s.
The actual environment variable values passed to each docker compose container can be checked by the `docker compose config` command:

```
docker compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f api/docker-compose.yml -f frontend/docker-compose.yml config
```

## Getting Started

To start TruBudget with docker compose check out previous section and make sure the command `docker compose` can be used.
Make sure your are in the `docker-compose` folder and use following command to manage your TruBudget node with docker compose:

Copy .env_example to .env to use the default configuration

```
cp .env_example .env
```

Deploy TruBudget

```
docker compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f api/docker-compose.yml -f frontend/docker-compose.yml up
```

When the setup has completed, you can open these URLs in the browser:

Frontend: http://localhost:3000/

API: http://localhost:8080/api/documentation/static/index.html

Uninstall TruBudget

```
docker compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f api/docker-compose.yml -f frontend/docker-compose.yml down
```

## Enable additional TruBudget Services

TruBudget's services are enabled by adding the related `docker-compose.yml`-file to the start command.
To enable the `excel-export-service` just add `-f excel-export-service/docker-compose.yml`:

```
docker compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f api/docker-compose.yml -f frontend/docker-compose.yml -f excel-export-service/docker-compose.yml up
```

## Why different docker compose files

There are more than one deployment use case for each service. Sometimes a tester would like to deploy a simple service for testing purposes, sometimes a developer implements a new feature and wants a service to be hot reloaded. For these different use cases there are different `docker-compose.yml` files. Another reason for different files is being as transparent as possible. If someone wants to know how to add persistence to Trubudget's blockchain service with docker compose, he/she can look at the corresponding docker-compose.yml where he/she can see the exact configuration of persistence only and doesn't have to search in a chaos of configuration.
Looking at the `blockchain`-folder following yaml files can be found:

| Yaml File                        | Description                                                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker-compose.alphanode.yml     | Deploys the blockchain service with alpha node configuration                                                                                                               |
| docker-compose.betanode.yml      | Deploys the blockchain service with beta node configuration                                                                                                                |
| hot-reloading.docker-compose.yml | Deploys the blockchain service connected to the local src folder. Every change to the src will be instantly applied to the service                                         |
| local-build.docker-compose.yml   | Deploys the blockchain service using a local built image. Make sure the image property is set to your local image, or your image is tagged docker-compose-blockchain:local |
| persistence.docker-compose.yml   | Deploys the blockchain service mounting a local folder into the container to persist data so if the container will be deleted the data is still saved to the machine       |

docker compose --project-directory . -f core.docker-compose.yml up

## Example

This section should give an example use case and the process to get the right docker compose working.
The use case is following:

- Alpha Trubudget node
- Export service enabled
- Documents should be used
- no test data needed
- data should not be lost (documents and blockchain data)
- frontend needed for api interaction
- the newest official version should be used

Let's analyze the use case:

- Alpha Trubudget node
  There are 2 different types of nodes (alpha, beta). Luckily there is a docker compose file in the blockchain folder which fit this requirement. So we choose `blockchain/docker-compose.alphanode.yml`.
- Export service enabled
  In the excel-export-service folder we can find the default docker-compose.yml which we can add to our docker compose command `excel-export-service/docker-compose.yml`.
- Documents should be used
  To use documents in TruBudget the storage-service is used. So we need the file `storage-service/docker-compose.yml`
- no test data needed
  The provisioning project is used to generate test data. We don't need it so we can skip it.
- data should not be lost (documents and blockchain data)
  To make sure we don't loose any data we need to know where we are storing data. Documents are stored in minio or azure blob storage via storage-service and all other data is stored onchain via blockchain service.
  This means we need to focus on the blockchain and the storage-service components. We can find persistence.docker-compose.yml files in these two service folders so we add them to our command `storage-service/persistence.docker-compose.yml` and `blockchain/persistence.docker-compose.yml`
- frontend needed for api interaction
  This means we need the api to interact with the blockchain and the frontend to show a dashboard to interact with. `api/docker-compose.yml` and `frontend/docker-compose.yml`
- the newest official version should be used
  This means we need to check the docker compose images. There we can find the image property as follows: `image: trubudget/blockchain:${TAG}`. There we can find the ${TAG} variable set as image tag. To make sure we are using the latest version of TruBudget we can change the `TAG` environment variable in our .env file to `latest`. Tough it is recommended to check the latest version of TruBudget on [docker-hub](https://hub.docker.com/u/trubudget) and use a specific tag like `v2.0.0`.

After analyzing the use case we can put the files together and create our docker compose commands.
First we want to check if every environment variable is passed correctly to each container. To check the whole final configuration of the docker-compose setup use `docker compose config` with the files you want to use:

```
docker compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f excel-export-service/docker-compose.yml -f storage-service/docker-compose.yml -f storage-service/persistence.docker-compose.yml -f blockchain/persistence.docker-compose.yml -f api/docker-compose.yml -f frontend/docker-compose.yml config
```

Double check the image tags and make sure you are using the correct ones.
If the configuration looks fine start the whole setup with `docker compose up`.

```
docker compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f excel-export-service/docker-compose.yml -f storage-service/docker-compose.yml -f storage-service/persistence.docker-compose.yml -f blockchain/persistence.docker-compose.yml -f api/docker-compose.yml -f frontend/docker-compose.yml up
```

## Persistence

There are two options how to persist data of a container:

1. Bind-Mount
   This option mounts a folder of the host system into the container. This is NOT recommended. There are limitations to that option. Since TruBudget is using non-root users to run a container the folder on the host system has to have the same user rights set before mounted into the container. Details can be found in the [official docker documentation](https://docs.docker.com/storage/bind-mounts/).

   Example of a bind-mount

   ```
    version: "3"
    services:
      blockchain:
        volumes:
          - /tmp/alpha_chain:${MULTICHAIN_DIR}
   ```

2. Volume
   This option mounts a volume create via docker into the container. This is the recommended option for TruBudget's persisted services. Details can be found in the [official docker documentation](https://docs.docker.com/storage/volumes/).
   Example of a bind-mount

   ```
    version: "3"
    services:
      blockchain:
        volumes:
          - alpha-volume:${MULTICHAIN_DIR}

    volumes:
      alpha-volume:
   ```

## E2E-test

To run the E2E-test a provisioned TruBudget instance has to be up and running. To achieve this execute following command first:

```
docker compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f storage-service/docker-compose.yml -f api/docker-compose.yml -f frontend/docker-compose.yml -f provisioning/docker-compose.yml up
```

After provisioning is logging `Successfully provisioned Trubudget!` or `The blockchain is already provisioned, skip provisioning ...` the e2e-test component can be added to the docker compose environment with following command (make sure you specify the e2e-test service at the end of the command "...up e2e-test"):

```
docker compose --project-directory . -f e2e-test/docker-compose.yml up e2e-test
```

## Multi node setup

Multi-node setup consists of following services:
- Alpha Blockchain Node
- Alpha API Service
- Alpha Frontend
- Provisioning Service to provision Alpha API/Node
- Beta Blockchain Node
- Beta API Service
- Beta Frontend

### How to start it?
Multi-node environment can be started with the following command (if current directory is docker-compose):

`docker compose --project-directory . -f multi-node/docker-compose.yml`

### Key points
> Please check the docker compose file or environment variables to see which ports are used for alpha and beta services.

> Since beta blockchain node requires approval to be able to join the network, you must first go to Nodes page on alpha-frontend and approve the new Organization/Node. Otherwise the beta-api won't be able to connect to the beta-node and will print out relevant errors.

## Logging-service

Logging service is started similarly to additional services. e.g: `-f frontend-collector/docker-compose.yml`

It is although important to pay attention to the logging service relevant environment variables! Following variables are for the logging service itself:
 - LOGGER_PORT
 - LOG_LEVEL
 - LOGGING_SERVICE_CACHE_DURATION
 - LOGGING_SERVICE_NODE_ENV

and variables below are used in frontend service:
 - REACT_APP_LOGGING
 - REACT_APP_LOG_LEVEL
 - REACT_APP_LOGGING_SERVICE_HOST
 - REACT_APP_LOGGING_SERVICE_PORT
 - REACT_APP_LOGGING_SERVICE_HOST_SSL
 - REACT_APP_LOGGING_PUSH_INTERVAL

