# Introduction and Basics

## Environment variables

All installation and user guides have one thing in common: They all use environment variables to customize the setup of TruBudget. To get started, you should know about the environment variables, their purpose and how to set them.

### Setting environment variables

Environment variables need to be set via the command line. Usually, they are only valid for the active session, i.e. if you close the terminal window in which you have set the environment variable and then open a new command line window, the value of the environment variable is lost.

Setting an environment variable requires different commands in Linux/OS X and Windows:

```bash
export VARIABLE="value" (Linux / OS X)
set VARIABLE="value" (Windows)
```

To check the value of a given variable, run the following command:

```bash
echo $VARIABLE (Linux / OS X)
echo %VARIABLE% (Windows)
```

> Note: In this case we assume you use the standard command line tool for Linux/OS X (which is Bash) and Windows (which is CMD).

### Environment Variables in TruBudget

The following environment variables are used either in the development mode or for installations (in the `.env` file) and need to be set:

- ORGANIZATION (required): In the blockchain network, each node is represented by its organization name. This environment variable sets this organization name. It is used to create the organization stream on the blockchain and is also displayed in the frontend's top right corner.
- ORGANIZATION_VAULT_SECRET (required): This is the key to en-/decrypt user data. If you want to add a new node for your organization and you want users to be able to log in on either node, make sure that both nodes have the same organization vault secret.
  **Caution: If you want to run TruBudget in production, make sure NOT to use the default value from the `.env_example` file!**
- API_PORT (default: 8080): The port used to expose the API for your installation. Example: If you run TruBudget locally and set API_PORT to `8080`, you can reach the API via `localhost:8080/api`.
- RPC_PORT: The port used to expose the blockchain of your installation. This will only be used internally for the communication between the API and the blockchain.
- TAG (default: master): Used for installations via `docker-compose` only. The tag defines the version of the image that is pulled from the docker hub.
- ROOT_SECRET (default: random): The root secret is the password for the root user. If you start with an empty blockchain, the root user is needed to add other users, approve new nodes,... If you don't set a value via the environment variable, the API generates one randomly and prints it to the console.
  > Caution: If you want to run TruBudget in production, make sure to set a secure root secret.
- P2P_TEST_HOST/P2P_PROD_HOST (required for slave nodes): The IP address of the blockchain master node you want to connect to. Since there are usually two instances (one for TEST and one for PROD) started, you need to set the environment variables accordingly.
- P2P_TEST_PORT/P2P_PROD_PORT (required for slave nodes): The port on which the master node has exposed the blockchain for the test and prod instance.
- API_TEST_HOST/API_PROD_HOST (required for slave nodes): The IP address of the API master node you want to connect to. Since there are usually two instances (one for TEST and one for PROD) started, you need to set the environment variables accordingly. (The IP addresses are usually the same as for the P2P host address).
- API_TEST_PORT/API_PROD_PORT (required for slave nodes): The port on which the master node has exposed the blockchain for the test and prod instance.
- LOG_LEVEL (optional, default: INFO): Sets the lowest level that is printed in the API logs. The API prints the log entries to `STDOUT` with varying levels ranging from `trace` to `fatal`. If the log level is set to a certain value, all log entries below are not printed (e.g. if the log level is set to `info`, the logs for `debug` and `trace` are ignored).
- PRETTY_PRINT (optional, default: true): Decides whether the logs printed by the API are pretty printed or not. Pretty printed logs are easier to read while non-pretty printed logs are easier to store and use e.g. in the ELK (Elasticsearch-Logstash-Kabana) stack.
- RPC_PASSWORD (required): Password used by the API to connect to the blockchain. The passoword is set by the origin node upon start. Every slave node needs to use the same RPC password in order to be able to connect to the blockchain.
- SWAGGER_BASEPATH (deprecated): This variable was used to choose which environment (prod or test) is used for testing the requests. The variable is deprecated now, as the Swagger documentation can be used for the prod and test environment separately.
- MULTICHAIN_DIR (default: "/root"): The path to the multichain folder where the blockchain data is persisted. For installations via `docker-compose`, this refers to the path within the docker container of the blockchain. For bare metal installations, this refers to the path on the machine the blockchain is running on.
- EXTERNAL_IP: The IP address with which the current node can be reached. Example: If you have a VM running on 52.52.52.52 and you want to start a slave node from this VM to connect to a master running on 53.53.53.53, you set the `EXTERNAL_IP` to 52.52.52.52 on this node.
- ACCESS_CONTROL_ALLOW_ORIGIN: This environment variable is needed for the feature "Export to Excel". Since the export service uses CORS (Cross Origin Resource Sharing), the domain by which it can be called needs to be set. Setting this value to `"*"` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
- PORT: This variable sets the port on which the service that exports TruBudget data to Excel is exposed. Caution: This currently only works for local setups and **not** for setups via `docker-compose`.

## Organizations and Nodes in TruBudget

One of the terms used most in TruBudget is _organization_. This section describes what organizations are in the context of TruBudget and how they interact with each other.

An _organization_ is a stakeholder in the funding process (e.g. Ministry of X). TruBudget is designed to connect multiple organizations together. Each organization creates their own users. Each user is associated to exactly one organization and can only login to nodes of that organization.

An organization can run one or more nodes. Each organization has exactly one wallet that can be used to vote when granting or revoking permissions to other wallet addresses, which is key to preventing a 51%-attack against the network. This means that even if one organization has multiple nodes, it gets only _one_ vote for adding new organizations to the network.

Each organization has one shared key to en-/decrypt the user data, which is set in via the `ORGANIZATION_VAULT_SECRET`. Every node of one organization needs to use the same key. If one node of an organization uses the same organization name, but a different organization vault secret, users created on other nodes cannot login on this faulty node, even though the name of the organization is the same.

Let's look at this using some examples.

### Two organizations: OrgaA (origin node), OrgaB (connecting to Organization A), Each with one Node

OrgaA starts a new origin node (i.e. a new, empty blockchain) and creates a new user called Alice. At this point, OrgaA has 100% voting power in the network since it is the only node. OrgaB then connects to OrgaA's node. After OrgaA approves the addition of a new node, OrgaB synchronizes the data and creates a new user called Bob. Alice and Bob can now both see the complete user list of the network (i.e. Alice and Bob), but Alice cannot login on OrgaB's node and Bob cannot login on OrgaA's node since they don't have the same `ORGANIZATION_VAULT_SECRET`. Each of the organizations now holds 50% of the voting power in the network.

### Two organizations: Additional Node

OrgaA has employees in another location and decides to add another node on a server on this location. OrgaA then creates a new node with the same name and `ORGANIZATION_VAULT_SECRET`. The request for a new node of an existing organization pops up in the frontend for both organizations. The addition of a new node for one organization does not create a new wallet address and therefore also does not need more than 50% approval. OrgaA approves the addition of a new node and creates a user account for Ava. Both OrgaA and OrgaB still hold 50% of the voting power.

Ava visits the other work location to work together with Alice. She can log in on the same node as Alice, since they share the same organization vault secret.

### Three organizations: OrgaC decides to join

OrgaC wants to join the network and connects to OrgaA. The request for approval is visible on the frontends of OrgaA and OrgaB. Since both of them hold 50% of the voting power, _both_ organizations need to approve OrgaC before it can join the network. After both organizations approve OrgaC, the data is synchronized and OrgaC creates a new user called Charlie. Like for the other organizations, Charlie can only login on the node of OrgaC. All three organizations now hold 33.33% of the voting power in the network.

## Further reading

If you want to read more about the concept of organizations, have a look at the [Multi Node Setup ADR](./adr/0010-multi-node-setup.md).
