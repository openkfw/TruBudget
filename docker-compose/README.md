# Docker Compose

Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application’s services. Then, with a single command, you create and start all the services from your configuration. To learn more about Compose and how to install it visit the [official docker website](https://docs.docker.com/compose/).

## docker-compose vs docker compose (v2)

Following guide is using the command `docker-compose`. It is recommended to use docker compose (v2). Most commands are also supported by docker-compose.
If you are using docker compose (v2) you can set an alias:

```
alias docker-compose="docker compose"
```

## Environment Variables

Environment variables for each service can be checked in the individual service `README.md` files.
All environment variables are configured via `.env` file. The `.env_example` file can be used as first configuration by copying it to `.env` file:

```
cp .env_example .env
```

All variables in the `.env` file are passed to one or more TruBudget docker-compose service per default, if another .env file should be used the `--env-file` option can be used.
The mapping of .env environment variables and docker-compose container variables can be checked in the used docker-compose.yml file/s.
The actual environment variable values passed to each docker-compose container can be checked by the `docker compose config` command:

```
docker-compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f api/docker-compose.yml -f frontend/docker-compose.yml up
```

## Getting Started

To start TruBudget with docker compose check out previous section and make sure the command `docker-compose` can be used.
Make sure your are in the `docker-compose` folder and use following command to manage your TruBudget node with docker compose:

Copy .env_example to .env to use the default configuration

```
cp.env_example .env
```

Deploy TruBudget

```
docker-compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f api/docker-compose.yml -f frontend/docker-compose.yml up
```

Uninstall TruBudget

```
docker-compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f api/docker-compose.yml -f frontend/docker-compose.yml down
```

## Enable additional TruBudget Services

TruBudget's services are enabled by adding the related `docker-compose.yml`-file to the start command.
To enable the `excel-export-service` just add `-f excel-export-service/docker-compose.yml`:

```
docker-compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f api/docker-compose.yml -f frontend/docker-compose.yml -f excel-export-service/docker-compose.yml up
```

## Why different docker-compose files

There are more than one deployment use case for each service. Sometimes a tester would like to deploy a simple service for testing purposes, sometimes a developer implements a new feature and wants a service to be hot reloaded. For these different use cases there are different `docker-compose.yml` files. Another reason for different files is being as transparent as possible. If someone wants to know how to add persistence to Trubudget's blockchain service with docker-compose, he/she can look at the corresponding docker-compose.yml where he/she can see the exact configuration of persistence only and doesn't have to search in a chaos of configuration.
Looking at the `blockchain`-folder following yaml files can be found:

| Yaml File                        | Description                                                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker-compose.alphanode.yml     | Deploys the blockchain service with alpha node configuration                                                                                                               |
| docker-compose.betanode.yml      | Deploys the blockchain service with beta node configuration                                                                                                                |
| hot-reloading.docker-compose.yml | Deploys the blockchain service connected to the local src folder. Every change to the src will be instantly applied to the service                                         |
| local-build.docker-compose.yml   | Deploys the blockchain service using a local built image. Make sure the image property is set to your local image, or your image is tagged docker-compose-blockchain:local |
| persistence.docker-compose.yml   | Deploys the blockchain service mounting a local folder into the container to persist data so if the container will be deleted the data is still saved to the machine       |

docker-compose --project-directory . -f core.docker-compose.yml up

## Example

This section should give an example use case and the process to get the right docker-compose working.
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
  There are 2 different types of nodes (alpha, beta). Luckily there is a docker-compose file in the blockchain folder which fit this requirement. So we choose `blockchain/docker-compose.alphanode.yml`.
- Export service enabled
  In the excel-export-service folder we can find the default docker-compose.yml which we can add to our docker-compose command `excel-export-service/docker-compose.yml`.
- Documents should be used
  To use documents in TruBudget the storage-service is used. So we need the file `storage-service/docker-compose.yml`
- no test data needed
  The provisioning project is used to generate test data. We don't need it so we can skip it.
- data should not be lost (documents and blockchain data)
  To make sure we don't loose any data we need to know where we are storing data. Documents are stored in minio via storage-service and all other data is stored onchain via blockchain service.
  This means we need to focus on the blockchain and the storage-service components. We can find persistence.docker-compose.yml files in these two service folders so we add them to our command `storage-service/persistence.docker-compose.yml` and `blockchain/persistence.docker-compose.yml`
- frontend needed for api interaction
  This means we need the api to interact with the blockchain and the frontend to show a dashboard to interact with. `api/docker-compose.yml` and `frontend/docker-compose.yml`
- the newest official version should be used
  This means we need to check the docker-compose images. There we can find the image property as follows: `image: trubudget/blockchain:${TAG}`. There we can find the ${TAG} variable set as image tag. To make sure we are using the latest version of TruBudget we can change the `TAG` environment variable in our .env file to `latest`. Tough it is recommended to check the latest version of TruBudget on [docker-hub](https://hub.docker.com/u/trubudget) and use a specific tag like `v2.0.0`.

After analyzing the use case we can put the files together and create our docker compose commands.
First we want to check if every environment variable is passed correctly to each container. To check the whole final configuration of the docker-compose setup use `docker-compose config` with the files you want to use:

```
docker-compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f excel-export-service/docker-compose.yml -f storage-service/docker-compose.yml -f storage-service/persistence.docker-compose.yml -f blockchain/persistence.docker-compose.yml -f api/docker-compose.yml -f frontend/docker-compose.yml config
```

Double check the image tags and make sure you are using the correct ones.
If the configuration looks fine start the whole setup with `docker-compose up`.

```
docker-compose --project-directory . -f blockchain/docker-compose.alphanode.yml -f excel-export-service/docker-compose.yml -f storage-service/docker-compose.yml -f storage-service/persistence.docker-compose.yml -f blockchain/persistence.docker-compose.yml -f api/docker-compose.yml -f frontend/docker-compose.yml up
```

## E2E-tests

tbd

## Multi node setup

tbd

## Logging-service

tbd
