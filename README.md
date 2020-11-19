# TruBudget <!-- omit in TOC -->

[![build status](https://travis-ci.com/openkfw/TruBudget.svg?branch=master)](https://travis-ci.com/openkfw/TruBudget)
[![gitter chat](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/Tru-Community/community)

# Table of Contents <!-- omit in TOC -->

- [Introduction](#introduction)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Starting the first TruBudget node](#starting-the-first-trubudget-node)
  - [Working with TruBudget](#working-with-trubudget)
  - [Adding new nodes to the network](#adding-new-nodes-to-the-network)
  - [Granting access for new nodes](#granting-access-for-new-nodes)
  - [Using TruBudget programatically through its API](#using-trubudget-programatically-through-its-api)
  - [Hints and Pitfalls](#hints-and-pitfalls)
- [Build and Develop from Local Sources](#build-and-develop-from-local-sources)
- [More Information](#more-information)

# Introduction

TruBudget - a trusted public expenditure tool. A collaborative workflow tool and secured platform to track and coordinate the implementation of donor-funded investment projects.

If you have questions or just want to talk to us, find us on [Gitter](https://gitter.im/Tru-Community/community)!

# Getting Started

These instructions will help you deploy your own TruBudget platform having two nodes of separate organizations connected to the same network.

> _Caution_: This guide is tested against Linux and OS X operating systems. For Windows, we recommend using the Git Bash (or something similar) to perform the commands listed below, but there could still be issues while performing some of the commands.

## Prerequisites

- [Docker](https://www.docker.com/) (version 17.06 or higher recommended)
- [Docker-Compose](https://docs.docker.com/compose/)

> In order to run the full tutorial you should run the TruBudget nodes in separate VM's

## Starting the first TruBudget node

The recommended option to get started with TruBudget is to use the latest stable docker images via docker-compose.
For more detailed information about the installation and the environment variables or alternative ways to setup TruBudget check out the [Installation Guide](./doc/tutorials/installation/bare-metal-installation.md).

The required environment variables are set in the `.env` file. If you want to use the standard setup, simply copy the `.env_example` file, otherwise explore the posible configuration options in it:

```bash
cd path/to/trubudget
cp .env_example .env
```

> Warning: Before you start with the standard configuration, please make sure that the ports `80`, `8080`, `8081`, `7447`, `7448` are not occupied by other processes. If yes, you can change the ports used in TruBudget inside the `.env` file.

To run a clean (empty) version of TruBudget, run the following script:

```bash
sh scripts/master/start-master-node.sh
```

> In case you want to start with a set of example data, you can also start TruBudget with the following script `sh scripts/master/start-and-provision-master-node.sh`. The process of provisioning may take several minutes (depending on your CPU) and can slow down your computer during the execution of the script. After provisioning you have acces to a set of users (e.g. `mstein` which share the password `test`)

This command will bootstrap a prod and test instance of TruBudget (blockchain, api, frontend) for you. Use `docker ps` to check on the running containers. You should see the following output:

```bash
➜ docker ps
CONTAINER ID        IMAGE                  COMMAND                  CREATED             STATUS              PORTS                              NAMES
6e70c64c84c9        trubudget_frontend     "/bin/sh -c '/bin/as…"   30 minutes ago      Up 30 minutes       0.0.0.0:80->80/tcp                 trubudget_frontend_1
b6e096c65ba8        trubudget_testapi      "/bin/sh -c 'npm sta…"   30 minutes ago      Up 30 minutes       0.0.0.0:8081->8080/tcp             trubudget_testapi_1
8d70d9f311a9        trubudget_api          "/bin/sh -c 'npm sta…"   30 minutes ago      Up 30 minutes       0.0.0.0:8080->8080/tcp             trubudget_api_1
49254c50b649        trubudget_master       "npm start"              30 minutes ago      Up 30 minutes       0.0.0.0:7447->7447/tcp, 8000/tcp   trubudget_master_1
0b458b72d14f        trubudget_testmaster   "npm start"              30 minutes ago      Up 30 minutes       8000/tcp, 0.0.0.0:7448->7447/tcp   trubudget_testmaster_1
```

Once the application is started (and the provisioning is done), you can visit the application at:

```
http://localhost:80
```

If you bootstraped an empty TruBudget instance, you need to provision some users first. In this case you have to log-in with the _root_, whose password is defined in the `.env` file with the environment variable `ROOT_SECRET`. The default value from the `.env_example` is:

```
User: root
Passwort: root-secret
```

> If the environment variable for ROOT_SECRET is not set, it is auto-generated by the API as a random string. The value is then printed to the API log.

The next step is to setup your first user.

## Working with TruBudget

Your first step is creating a new user. Follow the instruction on [User-Guide: Setup a User](./doc/wiki/User-Guide/Users-Groups/User.md). Don't forget to grant permissions to your users.

Now you can create you first project, subproject and workflow items following the [User-Guide: Resources](./doc/wiki/User-Guide#projects).

TruBudget is a distributed platform built on Blockchain, so let's add a new node to our network!

## Adding new nodes to the network

Let's define _organization_ first. An organization is a stakeholder in the funding process (e.g. Minsistry of X). TruBudget is designed to connect multiple organizations together. Each organization creates their own users. From a network perspective, an organization can run one or more nodes. Each organization has exactly one wallet that can be used to vote when granting or revoking permissions to wallet addresses, which is key to preventing a 51%-attack against the network. A consequence of this mechanism is that a user may only sign-in on nodes that belong to his/her organization (find more on this at [Network: Nodes](./doc/wiki/User-Guide/Network/Nodes.md)). If you want to read more about the concept of organizations, have a look at the [Multi Node Setup ADR](./doc/adr/0010-multi-node-setup.md).

Start up a new VM, again check out the project and copy the `.env` file, as you did in the first step. Let's take a deeper look at it:

| Variable                  | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| ORGANIZATION              | The name of your organization                               |
| ORGANIZATION_VAULT_SECRET | The secret for your organization                            |
| P2P\_<TEST / PROD>\_HOST  | The address of the remote node you want to connect to       |
| P2P\_<TEST / PROD>\_PORT  | The port of the remote node you want to connect to          |
| API\_<TEST / PROD>\_HOST  | The address of the remote master api you want to connect to |
| API\_<TEST / PROD>\_PORT  | The port of the remote master api you want to connect to    |

You can only connect to an existing organization if you know its `ORGANIZATION_VAULT_SECRET`. If you create a new organization, simply set the `ORGANIZATION` to the name of your new organization and set a `ORGANIZATION_VAULT_SECRET` which is kept secret inside your organization

Well, let's create a new organization (`CoolNewOrga`) which wants to connect to our node (the one we created in the first step):

```
...
ORGANIZATION=CoolNewOrga
ORGANIZATION_VAULT_SECRET=moresecretthananythingelse
...
P2P_TEST_HOST=51.51.51.51
P2P_TEST_PORT=7448
API_TEST_HOST=51.51.51.51
API_TEST_PORT=8081
P2P_PROD_HOST=51.51.51.51
P2P_PROD_PORT=7447
API_PROD_HOST=51.51.51.51
API_PROD_PORT=8080
...
```

As you can see, we have set the `ORGANIZATION` and `ORGANIZATION_VAULT_SECRET` variables and additionaly set the IP-Address of the node we created in the first step (e.g. in our case `51.51.51.51`)

Now start

```bash
sh scripts/master/start-slave-node.sh
```

and you will connect yourself to the network and ask for access permissions. If you look at the console output of the new node, you will see an error. This error comes from the node, trying to access the network but being rejected.

To proceed from here let's jump to the next step and grant the newly created node permission to access the network.

## Granting access for new nodes

TruBudget creates a private network. This means new nodes have to ask already registered nodes for permissions to join. When granting access we are using a democratic aproach to do so, by requiring at least half of the current organizations to approve a new node. In our case, we only have one organization (the one you created in the first step), which has currently 100% of the voting power.

To grant permissions, simply log in on the first TruBudget node (the one you created in the first step) and follow the instructions in the [Node-Guide](./doc/wiki/User-Guide/Network/Nodes.md).

In the node section you should see that you need to approve a new node and organization. Approve it the requesting node (the one from the third step) will start to automatically connect and synchronize with the network (check the logs of the node created in the third step).

> Warning: Keep in mind, we are always deploying two separate networks (`prod` and `test`). This means you need to approve the new node in each network separately. You can switch the network through a dropdown on the login screen.

## Using TruBudget programatically through its API

TruBudget comes with a frontend, but we greatly encourage to create own frontends or attach your existing systems to TruBudget. Therefore everything you can do in TruBudget can be done through a well documented HTTP/JSON interface. You can access and test-drive the API using the swagger documentation which is exposed by the TruBudget API under the route `/api/documentation/static/index.html`. Since we have already two nodes running, lets access the API documentation of the node we deployed in the first step.

```
For the prod network:
http://localhost:8080/api/documentation/static/index.html

For the test network:
http://localhost:8081/api/documentation/static/index.html
```

## Hints and Pitfalls

Obviously this is just a short introduction on how to start and use the platform but you can get quite far with it. Nevertheless, there are a few points which you need to consider if you want to go into more details or use TruBudget in production.

- Secrets: You will be using different secrets and it is essential to keep this in a secure place. The `ORGANIZATION_VAULT_SECRET` restricts who can join an organization and make transaction on their behalf. The `ROOT_SECRET` grants access for a super admin (the _root_ user) on the API and should only be used to create the first admin user. The `RPC_SECRET` restricts access to the Multichain API and should be different for every node.
- You can't delete: You are on a blockchain! All your actions and changes will be visible (this is why we use a blockchain ;)). Therefore we always provide a test-network to play around (you can select the network on the login screen). If you are in a country which falls under GDPR or other personal data protection laws you should never store personal data in TrudBudget.
- Privacy: _Data at rest_ and _Data in transit_ is _not_ encrypted. If this is important for you, your infrastructure has to provide adequate measures to ensure this level of privacy (e.g. disk encryption, VPN). Obviously passwords are encrypted and _not_ stored in clear text.
- Access-Control: Be aware that since we are in blockchain, data will be replicated across all nodes and is potentially readable by all nodes (_except_ passwords). A much higher level of access control is enforced through the TruBudget API which will restrict the amount of data a user can see or update. If you want to grant access to a party you are not fully trusting, _never_ grant them direct access to the Multichain node (through RPC) instead expose the TruBudget API and created a user with the individual permissions for them.
- Persistence: By default, the blockchain will store its local date inside the /tmp folder of your host system. Depending on your OS configuration this could be a volatile space (e.g. could be deleted on boot up). You should change this path the location of your choice. To do so, simply edit the docker-compose files inside the `./docker-compose` [folder](./docker-compose). _we plan to change the default location in future updates_

# Build and Develop from Local Sources

Checkout the [Contributor Guide](./doc/tutorials/contribute/Contributor-Guide.md) to learn how to set up your environment to start developing and debugging the TruBudget application.

# More Information

Check out our [**Trubudget-Wiki**](./doc/README.md) to find out how Trubudget works.
