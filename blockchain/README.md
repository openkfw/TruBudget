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

The Blockchain node is fully configurated through environment variables.

### Environment Variables

| Env Variable                | Required | Default Value | Description                                                                                                                                                                                                                                                                                                                                        |
| --------------------------- | -------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API_HOST                    | no       |               | Used to build the URL to the master-node's API when requesting network access. (The IP addresses are usually the same as for the P2P host address).                                                                                                                                                                                                |
| API_PORT                    | no       | 8080          | The port used to connect to the master-node's api.                                                                                                                                                                                                                                                                                                 |
| API_PROTO                   | no       | http          | The Protocol which should be used to connect to the master-node's api. (http, https)                                                                                                                                                                                                                                                               |
| EXTERNAL_IP                 | no       |               | The IP address with which the current node can be reached. The variable is forwarded to the mutlichain dameon as `externalip` argument. <br>Example: If you have a VM running on 52.52.52.52 and you want to start a slave node from this VM to connect to a master running on 53.53.53.53, you set the `EXTERNAL_IP` to 52.52.52.52 on this node. |
| LOG_LEVEL                   | no       | INFO          | Sets the lowest level to the pino logger that is printed to `STDOUT` with varying levels ranging from `trace` to `fatal`.                                                                                                                                                                                                                          |
| MULTICHAIN_DIR              | no       | /root         | The path to the multichain folder where the blockchain data is persisted. For installations via `docker-compose`, this refers to the path within the docker container of the blockchain. For bare metal installations, this refers to the path on the machine the blockchain is running on.                                                        |
| ORGANIZATION                | yes      | -             | In the blockchain network, each node is represented by its organization name. This environment variable sets this organization name. It is used to create the organization stream on the blockchain.                                                                                                                                               |
| P2P_HOST                    | no       |               | The IP address of the blockchain node you want to connect to. When given, the node joins the existing network rather than creating its own chain.                                                                                                                                                                                                  |
| P2P_PORT                    | no       | 7447          | The port on which the node you want to connect to has exposed the blockchain.                                                                                                                                                                                                                                                                      |
| PRETTY_PRINT                | no       | true          | Decides whether the logs printed by the API are pretty printed or not. Pretty printed logs are easier to read while non-pretty printed logs are easier to store and use e.g. in the ELK (Elasticsearch-Logstash-Kabana) stack.                                                                                                                     |
| RPC_ALLOW_IP                | no       | 0.0.0.0/0     | It refers to an allowed IP address range, given either by IP or CIDR notation. 0.0.0.0/0 will allow access from anywhere.                                                                                                                                                                                                                          |
| RPC_USER                    | no       | multichainrpc | The user used to connect to the multichain daemon.                                                                                                                                                                                                                                                                                                 |
| RPC_PASSWORD                | no       | [hardcoded]   | Password used by the API to connect to the blockchain. The password is set by the origin node upon start. Every slave node needs to use the same RPC password in order to be able to connect to the blockchain. <br>**Hint:** Although the RPC_PASSWORD is not required it is highly recommended to set an own secure one                          |
| RPC_PORT                    | no       | 8000          | The port used to expose the multichain daemon of your Trubudget blockchain installation(bc). The port used to connect to the multichain daemon(api). This will be used internally for the communication between the API and the multichain daemon.                                                                                                 |
| ACCESS_CONTROL_ALLOW_ORIGIN | no       | "\*"          | This environment variable is needed for the feature "Export to Excel". Since the export service uses CORS, the domain by which it can be called needs to be set. Setting this value to `"*"` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).               |
| CI_COMMIT_SHA               | no       |               | The /version endpoint returns this variable as `commit` property                                                                                                                                                                                                                                                                                   |
| BUILDTIMESTAMP              | no       |               | The /version endpoint returns this variable as `buildTimeStamp` property                                                                                                                                                                                                                                                                           |
| BLOCKNOTIFY_SCRIPT          | no       |               | Configure the blocknotifiy argument of the multichain configuration like -blocknotify=[BLOCKNOTIFY_SCRIPT]                                                                                                                                                                                                                                         |

#### Email-Service

| Env Variable               | Required | Default Value    | Description                                                                                                                                                      |
| -------------------------- | -------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EMAIL_SERVICE              | no       | DISABLED         | If set to `ENABLED` the Email-Service feature is enabled and the EMAIL\_\* variables are required                                                                |
| EMAIL_HOST                 | no       |                  | The IP address from the email-notification service.                                                                                                              |
| EMAIL_PORT                 | no       |                  | The port address from the email-notification service.                                                                                                            |
| EMAIL_SSL                  | no       | false            | If set to `true` the connection between blockchain and email-notification service is https instead of http                                                       |
| NOTIFICATION_PATH          | no       | ./notifications/ | The path where notification files shall be saved on the blockchain environment                                                                                   |
| NOTIFICATION_MAX_LIFETIME  | no       | 24               | This number configure how long notifications shall be saved in the NOTIFICATION_PATH in hours                                                                    |
| NOTIFICATION_SEND_INTERVAL | no       | 10               | This number configure in which interval the notifications in the NOTIFICATION_PATH should be checked and send                                                    |
| JWT_SECRET                 | no       |                  | The `JWT_SECRET` is only required if the Email feature is enabled. It is used to authenticate the blockchain at the email-service, so it can send notifications. |

#### Kubernetes

| Env Variable | Required | Default Value | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------ | -------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EXPOSE_MC    | no       | false         | If set to true, Trubudget tries to expose it's multichain via kubernetes' ingress. First a kubernetes config file is searched in `/.kube/config`. If not found and the MC is deployed in a cluster, it is search for the service account to get the information. After configuration the `externalip` arg is set to the ip of the service' ingress of the configured cluster SERVICE_NAME and NAMESPACE are required to access the ingress of the service. |
| SERVICE_NAME | no       |               | This variable is only required if EXPOSE_MC is set to true. It defines which service the kubernetes client should search for in the configured kubernetes cluster                                                                                                                                                                                                                                                                                          |
| NAMESPACE    | no       |               | This variable is only required if EXPOSE_MC is set to true. It defines in which namespace the kubernetes client should search for the given service                                                                                                                                                                                                                                                                                                        |

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

If `EMAIL_SERVICE` is set to "ENABLED" and `EMAIL_HOST` and `EMAIL_PORT` are set too the multichain-feed is attached to the multichaindaemon and the notification-watcher starts watching the `NOTIFICATION_PATH` for new incoming notification transactions. In other words The blockchain starts the background processes to send user ids to the email-notification service. `EMAIL_SSL` is a flag to define if the connection of the blockchain application and the email-service shall be https(true) or http(false).

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

More details about the email notification service can be found in the [email notification documentation](../email-notification/README.md#)

## Disable email notifications

To disable email notifications for blockchain simply set the `EMAIL_SERVICE` to "DISABLED" or unset it.
If disabled the multichain-feed is not applied to the multichain-deamon and notifications are not created.

**Hint:** To prevent the frontend requesting an email-notifcations readiness call simply unset the email notification service environment variable in the frontend. More details can be found in the [frontend documentation](../frontend/README.md#email-notifications)
