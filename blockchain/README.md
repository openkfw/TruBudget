# TruBudget Blockchain

This project encapsulates the Multichain implementation for Trubudget. It can be seen as the data tier in Trubudget

## Master vs. Slave Mode

Trubudget is a private Blockchain (BC) network. That means a master need to give new nodes (slaves) a one-time grant in order to access the network. The decision if I want to spawn a Master or a Slave node is simple:

- Masternode: I want to create a new network
- Slavenode: I want to participate on an existing network

## Lifecycle

As described before: The Trubudget Blockchain is created one by a master, which then grants slaves access on demand.

1.  Start Master-Node of Trubudget Blockchain (Master sets chain configurations for network and has admit privileges)
1.  Start API (Master-API)
1.  API will set up Master-Node for Trubudget (creating Admin-Streams)
1.  Start Slave-Node(s)
1.  Slave-Node will try to join the network by connection to the master-node
1.  Slave-Node attempt to access the network will be rejected because they have not be granted access
1.  Slave-Node frequests to be granted access to the network by sending its blockchain-address and information about the Organization operating the node to the Master-API
1.  Eventually, Master-API grants read/write (not admin) access to the network for the supplied address
1.  Slave-Node retries to join the network
1.  Slave-Node is granted access and syncronized blockchain data

## Configuration

The Blockchain node is fully configurated through environment variables

### `ORGANIZATION` (required)

Identifer for Organization (needs to match Organization of User defined in the API's rights & role management, e.g. UmbrellaCorp)

### `P2P_HOST`

The hostname of an existing MultiChain peer. When given, the node joins the existing network rather than creating its own chain.

### `P2P_PORT`

The port used by MultiChain for peer-to-peer communication among nodes (same for all nodes).

### `API_PROTO`, `API_HOST`, `API_PORT`

Used to build the URL to the master-node's API when requesting network access.

### `deprecated: CHAINNAME`

Uniquely identifies the chain. Note that a MultiChain network always relates to exactly one chain (name).

### `RPC_PORT`, `RPC_USER`, `RPC_PASSWORD`, `RPC_ALLOW_IP`

RPC connection settings for executing commands against the MultiChain node. The `RPC_ALLOW_IP` settings refers to an allowed IP address range, given either by IP or CIDR notation; for example, 0.0.0.0/0 will allow access from anywhere.

### `EMAIL_SERVICE_ENABLED`, `EMAIL_HOST`, `EMAIL_PORT`,`EMAIL_SSL`, `NOTIFICATION_PATH`

These environment variables configure the email service. `EMAIL_HOST`, `EMAIL_PORT` are describing the hostname/port of the Trubudget email-service. If `EMAIL_SERVICE_ENABLED` is set to true and `EMAIL_HOST` and `EMAIL_PORT` are set too the multichain-feed is attached to the multichaindaemon and the notification-watcher starts watching for new incoming notification transaction - in short: The blockchain starts the background processes to send user ids to the notification.send endpoint. `EMAIL_SSL` is a flag to define if the connection of the blockchain application and the email-service shall be https(true) or http(false). `NOTIFICATION_PATH` is the path where notification files shall be saved. These variables are only required if an email service shall be configured. More about how the email service is set up can be found in the [Enable email service section](#enable-email-notifications) .

## Getting started

The easiest way to get started is to use our pre-set `docker-compose` cluster which starts the whole TruBudget application (that means you need to install [Docker](https://www.docker.com/community-edition#/download)). It uses the local build of the blockchain and the master-deployments of the TruBudget API and Frontend. The pre-set cluster contains:

- 1 Master-Node + 1 Slave-Node
- 1 Master API connected to Master-Node
- 1 Frontend connected to Master-API

Since the required docker images are located in the private Dockerregistry you need to authenticate.

To do so you simply create a login token by `$ echo $DOCKER_PASSWORD > DOCKER_REGISTRY_PASSWORD`

If you have set your password token you can simply start the cluster `$ ./startDev.sh`

Enjoy!

## Enable email notifications

The easiest way to get started is to use our pre-set `docker-compose` cluster available in the `email-notification` project which starts the whole TruBudget application including all email components(that means you need to install [Docker](https://www.docker.com/community-edition#/download)).
The pre-set cluster contains:

- 1 Master-Node
- 1 Master API connected to Master-Node
- 1 Frontend connected to Master-API
- 1 Email-Service
- 1 Email-Database (Postgres)

When started the Email-Service sends email notifications to the configured SMTP-host. The default configuration is:

- SMTP_HOST: host.docker.internal(localhost)
- SMTP_PORT: 2500

More details about how to configure the `Email-Service` can found in the [email-notification project](../email-notification/README.md)

## Disable email notifications

To disable email notifications simply set the EMAIL_SERVICE
