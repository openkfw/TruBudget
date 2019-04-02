# TruBudget <!-- omit in TOC -->

[![build status](https://travis-ci.com/openkfw/TruBudget.svg?branch=master)](https://travis-ci.com/openkfw/TruBudget)
[![gitter chat](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/Tru-Community/community)
[![Coverage Status](https://coveralls.io/repos/github/openkfw/TruBudget/badge.svg)](https://coveralls.io/github/openkfw/TruBudget)

# Table of Contents <!-- omit in TOC -->

- [Introduction](#introduction)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
- [Build and Develop from Local Sources](#build-and-develop-from-local-sources)
- [Troubleshooting](#troubleshooting)
- [More Information](#more-information)
- [FAQ](#faq)

# Introduction

TruBudget - a trusted public expenditure tool. A collaborative workflow tool and secured platform to track and coordinate the implementation of donor-funded investment projects.

# Getting Started

These instructions will get you a copy of the project up and running on your local machine.

>_Caution_: This guide works well wil Linux and OS X operating systems. For Windows, we recommend using the Git Bash (or something similar) to perform the commands listed below, but there could still be issues while performing some of the commands.

## Prerequisites

- [Docker](https://www.docker.com/) (Version 17.03.0+)
- [Docker-Compose](https://docs.docker.com/compose/) (Version 3+)

## Installing

The recommended option to get started with TruBudget is to use the latest stable docker images via docker-compose.
For more detailed information about the installation and the environment variables or alternative ways to setup TruBudget check out the [Installation Guide](./doc/wiki/Installation-Guide/Installation-Guide.md).

Setting required environment variables via `.env` file. If you want to use the standard setup, simply copy the `.env_example` file: 

```bash
cd path/to/trubudget
cp .env_example .env
```

>Tip: If you want to checkout a certain version of TruBudget change the `TAG` environment variable. By default it is set to `TAG=master`. 

Before you start with the standard configuration, please make sure that the port `80` (used by the frontend) is free.

To run TruBudget, run the following script: 

```bash
sh scripts/master/start-and-provision-master-node.sh
```

This will start a prod and test instance of TruBudget (blockchain, api, frontend) with a standard set of projects and users (i.e. 'provisioned blockchain'). 
> Caution: The process of provisioning may take several minutes (depending on your CPU) and can slow down your computer during the execution of the script.

If you want to start with an empty blockchain (i.e. without any users but `root` and without any projects), you can run: 
```
sh scripts/master/start-master-node.sh
```

Use `docker ps` to check on the running containers: 

```bash
➜ docker ps
CONTAINER ID        IMAGE                           COMMAND                  CREATED             STATUS              PORTS                NAMES
41c3453e505c        trubudget/frontend:master       "/bin/sh -c '/bin/as…"   5 minutes ago       Up 5 minutes        0.0.0.0:80->80/tcp   trubudget_frontend_1
5dacb07a93a3        trubudget/provisioning:master   "npm start"              5 minutes ago       Up 5 minutes                             trubudget_provision-test_1
296e0d16435c        trubudget/provisioning:master   "npm start"              5 minutes ago       Up 5 minutes                             trubudget_provision-prod_1
c6426a0ee5f5        trubudget/api:master            "/bin/sh -c 'npm sta…"   5 minutes ago       Up 5 minutes                             trubudget_testapi_1
27d71e0678d0        trubudget/api:master            "/bin/sh -c 'npm sta…"   5 minutes ago       Up 5 minutes                             trubudget_api_1
760e9736c0dc        trubudget/blockchain:master     "npm start"              5 minutes ago       Up 5 minutes        7447/tcp, 8000/tcp   trubudget_master_1
a8b3442490b5        trubudget/blockchain:master     "npm start"              5 minutes ago       Up 5 minutes        7447/tcp, 8000/tcp   trubudget_testmaster_1
```

Once the application is started (and the provisioning is done), you can visit the application at:
```
http://localhost:80
```

To log in, use the following standard login (as defined in the `.env` file)
```
User: root
Passwort: root-secret
```
With this user you can see the provisioned projects and users, if you started with a provisioned blockchain.

The blockchain data is persisted on your hard drive. The standard location on Linux and OS X for this is: 
```
/tmp/bcMasterVolume 
``` 


# Build and Develop from Local Sources

Checkout the [Contributor Guide](https://github.com/openkfw/TruBudget/blob/master/doc/wiki/Contributor-Guide/Contributor-Guide.md) to learn how to set up your environment to start developing and debugging the TruBudget application.

# Troubleshooting
TBD

# More Information

Check out our [**Trubudget-Wiki**](./doc/README.md) to find out how Trubudget works.

# FAQ

| Description | Link |
| :---------- | :--- |
