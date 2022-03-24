# TruBudget Blockchain

This project encapsulates the Multichain implementation for Trubudget. It can be seen as the data tier in Trubudget

## Getting started

The easiest way to get started is to use our pre-set `docker-compose` cluster which starts the whole TruBudget application (that means you need to install [Docker](https://www.docker.com/community-edition#/download)). It uses the local build of the blockchain and the alpha-deployments of the TruBudget API and Frontend. The pre-set cluster contains:

- 1 Alpha-Node + 1 Beta-Node
- 1 Alpha API connected to Alpha-Node
- 1 Frontend connected to Alpha-API

Since the required docker images are located in the private Docker registry you need to authenticate.

To do so you simply create a login token by `$ echo $DOCKER_PASSWORD > DOCKER_REGISTRY_PASSWORD`

If you have set your password token you can simply start the cluster `$ ./start-service.sh`

Enjoy!

## Configuration

The Blockchain node is fully configured through environment variables.

### Environment Variables

Depending on the Trubudget setup environment variables

| Env Variable                | Required | Default Value             | Description                                                                                                                                                                                                                                                                                                                                        |
| --------------------------- | -------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API_HOST                    | no       |                           | Used to build the URL to the alpha-node's API when requesting network access. (The IP addresses are usually the same as for the P2P host address).                                                                                                                                                                                                 |
| API_PORT                    | no       | 8080                      | The port used to connect to the alpha-node's api.                                                                                                                                                                                                                                                                                                  |
| API_PROTO                   | no       | http                      | The Protocol which should be used to connect to the alpha-node's api. (http, https)                                                                                                                                                                                                                                                                |
| EXTERNAL_IP                 | no       |                           | The IP address with which the current node can be reached. The variable is forwarded to the mutlichain daemon as `externalip` argument. <br/>Example: If you have a VM running on 52.52.52.52 and you want to start a beta node from this VM to connect to an alpha running on 53.53.53.53, you set the `EXTERNAL_IP` to 52.52.52.52 on this node. |
| LOG_LEVEL                   | no       | info                      | Defines the log output. Supported levels are `trace`, `debug`, `info`, `warn`, `error`, `fatal`                                                                                                                                                                                                                                                    |
| MULTICHAIN_DIR              | no       | /root                     | The path to the multichain folder where the blockchain data is persisted. For installations via `docker-compose`, this refers to the path within the docker container of the blockchain. For bare metal installations, this refers to the path on the machine the blockchain is running on.                                                        |
| ORGANIZATION                | yes      | -                         | In the blockchain network, each node is represented by its organization name. This environment variable sets this organization name. It is used to create the organization stream on the blockchain.                                                                                                                                               |
| P2P_HOST                    | no       |                           | The IP address of the blockchain node you want to connect to. When given, the node joins the existing network rather than creating its own chain.                                                                                                                                                                                                  |
| P2P_PORT                    | no       | 7447                      | The port on which the node you want to connect to has exposed the blockchain.                                                                                                                                                                                                                                                                      |
| PRETTY_PRINT                | no       | false                     | Decides whether the logs printed by the API are pretty printed or not. Pretty printed logs are easier to read while non-pretty printed logs are easier to store and use e.g. in the ELK (Elasticsearch-Logstash-Kabana) stack.                                                                                                                     |
| RPC_ALLOW_IP                | no       | 0.0.0.0/0                 | It refers to an allowed IP address range, given either by IP or CIDR notation. 0.0.0.0/0 will allow access from anywhere.                                                                                                                                                                                                                          |
| MULTICHAIN_RPC_USER         | no       | multichainrpc             | The user used to connect to the multichain daemon.                                                                                                                                                                                                                                                                                                 |
| MULTICHAIN_RPC_PASSWORD     | no       | [hardcoded]               | Password used by the API to connect to the blockchain. The password is set by the origin node upon start. Every beta node needs to use the same RPC password in order to be able to connect to the blockchain. <br/>**Hint:** Although the MULTICHAIN_RPC_PASSWORD is not required it is highly recommended to set an own secure one               |
| MULTICHAIN_RPC_PORT         | no       | 8000                      | The port used to expose the multichain daemon of your Trubudget blockchain installation(bc). The port used to connect to the multichain daemon(api). This will be used internally for the communication between the API and the multichain daemon.                                                                                                 |
| PORT                        | no       | 8085                      | This is the port where the multichain can be downloaded (backup)                                                                                                                                                                                                                                                                                   |                                                                                                                                                            |
| ACCESS_CONTROL_ALLOW_ORIGIN | no       | "\*"                      | This environment variable is needed for the feature "Export to Excel". Since the export service uses CORS, the domain by which it can be called needs to be set. Setting this value to `"*"` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).               |
| CI_COMMIT_SHA               | no       |                           | The /version endpoint returns this variable as `commit` property                                                                                                                                                                                                                                                                                   |
| BUILDTIMESTAMP              | no       |                           | The /version endpoint returns this variable as `buildTimeStamp` property                                                                                                                                                                                                                                                                           |
| BLOCKNOTIFY_SCRIPT          | no       |                           | Configure the blocknotifiy argument of the multichain configuration like -blocknotify=[BLOCKNOTIFY_SCRIPT]                                                                                                                                                                                                                                         |
| NODE_ENV                    | yes      | development or production | Environment: Default development when running development-script. Production when running production-script                                                                                                                                                                                                                                        |
| CERT_PATH                   | no       |                           | The path to the certificate used by the blockchain to authenticate with the connection peer. Note that self-signed certificates are not allowed in production environments. [More information can be found here](https://www.cloudflare.com/en-gb/learning/access-management/what-is-mutual-authentication/)                                       |
| CERT_CA_PATH                | no       |                           | The path to the certificate authority root certificate by the blockchain to authenticate with the connection peer. Note that self-signed certificates are not allowed in production environments.[More information can be found here](https://www.cloudflare.com/en-gb/learning/access-management/what-is-mutual-authentication/)                  |
| CERT_KEY_PATH               | no       |                           | The path to the certificate key used by the blockchain to authenticate with the connection peer. [More information can be found here](https://www.cloudflare.com/en-gb/learning/access-management/what-is-mutual-authentication/)                                                                                                                  |
| MULTICHAIN_FEED_ENABLED     | no       | false                     | bc                                                                                                                                                                                                                                                                                                                                                 | If set to true the multichain-feed go script in src/multichain-feed/multichain-feed is passed to the multichain daemon and executed in a separate process. |
| AUTOSTART                   | no       | true                      | bc                                                                                                                                                                                                                                                                                                                                                 | If set to false multichain daemon will not start automatically.                                                                                            |

#### Email-Service

The email-service can be configured via the following environment variables.
To get started have a look at dedicated [documentation](./email-notification-service/README)

| Env Variable               | Required | Default Value    | Description                                                                                                                                                      |
| -------------------------- | -------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EMAIL_SERVICE_ENABLED      | no       | false            | If set to `true` the Email-Service feature is enabled and the EMAIL\_\* variables are required                                                                   |
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

## Lifecycle

As described before: The Trubudget Blockchain is created by an alpha, then grants betas access on demand.

1.  Start Alpha-Node of Trubudget Blockchain (Alpha sets chain configurations for network and has admit privileges)
1.  Start API (Alpha-API)
1.  API will set up Alpha-Node for Trubudget (creating Admin-Streams)
1.  Start beta-Node(s)
1.  Beta-Node will try to join the network by connection to the alpha-node
    1.  If mutual authentication is enabled, the blockchain can only request to access the network when providing a valid certificate. In case the certificate is not valid, the Alpha API will reject the node immediately
1.  Beta-Node attempt to access the network will be rejected because they have not been granted access
1.  Beta-Node requests to be granted access to the network by sending its blockchain-address and information about the Organization operating the node to the Alpha-API
1.  Eventually, Alpha-API grants read/write (not admin) access to the network for the supplied address
1.  Beta-Node retries to join the network
1.  Beta-Node is granted access and synchronized blockchain data

## Alpha vs. Beta Node

Trubudget is a private Blockchain (BC) network. That means an Alpha need to give new nodes (betas) a one-time grant in order to access the network. The decision if I want to spawn an Alpha or a Beta node is simple:

- Alpha node: I want to create a new network
- Beta node: I want to participate on an existing network

## Mutual Authentication

Mutual Authentication is a feature that ensures that only nodes with a valid certificate can access the network.
A node, which wants to access the network, has to authenticate itself against the Alpha API with a valid certificate.
If the certificate is not valid, the API will reject the request. If the certificate is valid, the API will accept the connection and the user can approve the connection.
More information about mutual authentication can be found [here](https://www.cloudflare.com/en-gb/learning/access-management/what-is-mutual-authentication/).
