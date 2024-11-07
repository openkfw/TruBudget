---
sidebar_position: 1
---

# Introduction and Basics
Welcome to the TruBudget operation and administration documentation! This guide offers key information relevant to operating and administrating a TruBudget network. 

## Table of Contents
  - [Introduction and Basics](#introduction-and-basics) - Basic information and a table of contents to get you started
    - [Introduction to Organizations and Nodes in TruBudget](#introduction-to-organizations-and-nodes-in-trubudget)
    - [Configuring TruBudget](#configuring-trubudget)
    - [Environment variables](#environment-variables)
  - [Architecture in TruBudget](./architecture.md#architecture-in-trubudget)  - Information on the TruBudget Architecture

  - [Debugging TruBudget](./debugging.md#debugging-trubudget) - Information on how to debug the issues within TruBudget 
  - [Encryption](./encryption.md#securing-communication-between-nodes)
  - [Installing TruBudget](./installation/README.md)
  - [Multichain-CLI](./multichain-cli.md#multichain-cli) - Information on how to use the Multichain-CLI to interact with the blockchain
  - [Resource Requirements](./resource-requirements.md#running-trubudget) - Information on minimum resource requirements for running TruBudget
  - [Security](./security.md#security--trubudget)
  - [Telemetry](./telemetry.md)
  - [Updating TruBudget](./update-trubudget.md#updating-trubudget) - Information on how to update and upgrade TruBudget to newer versions as well as create backups

## Introduction to Organizations and Nodes in TruBudget

One of the terms used most in TruBudget is _organization_. This section describes what organizations are in the context of TruBudget and how they interact with each other.

An _organization_ is a stakeholder in the funding process (e.g. Ministry of X). TruBudget is designed to connect multiple organizations together. Each organization creates their own users. Each user is associated to exactly one organization and can only login to nodes of that organization.

An organization can run one or more nodes. Each organization has exactly one wallet that can be used to vote when granting or revoking permissions to other wallet addresses, which is key to preventing a 51%-attack against the network. This means that even if one organization has multiple nodes, it gets only _one_ vote for adding new organizations to the network.

Each organization has one shared key to en-/decrypt the user data, which is set in via the `ORGANIZATION_VAULT_SECRET`. Every node of one organization needs to use the same key. If one node of an organization uses the same organization name, but a different organization vault secret, users created on other nodes cannot login on this faulty node, even though the name of the organization is the same.

### Let's look at this using some examples.

#### Two organizations: Orga1 (origin node), Orga2 (connecting to Organization 1), Each with one Node

Orga1 starts a new origin node (i.e. a new, empty blockchain) and creates a new user called Alice. At this point, Orga1 has 100% voting power in the network since it is the only node. Orga2 then connects to Orga1's node. After Orga1 approves the addition of a new node, Orga2 synchronizes the data and creates a new user called Bob. Alice and Bob can now both see the complete user list of the network (i.e. Alice and Bob), but Alice cannot login on Orga2's node and Bob cannot login on Orga1's node since they don't have the same `ORGANIZATION_VAULT_SECRET`. Each of the organizations now holds 50% of the voting power in the network.

#### Two organizations: Additional Node

Orga1 has employees in another location and decides to add another node on a server on this location. Orga1 then creates a new node with the same name and `ORGANIZATION_VAULT_SECRET`. The request for a new node of an existing organization pops up in the frontend for both organizations. The addition of a new node for one organization does not create a new wallet address and therefore also does not need more than 50% approval. Orga1 approves the addition of a new node and creates a user account for Ava. Both Orga1 and Orga2 still hold 50% of the voting power.

Ava visits the other work location to work together with Alice. She can log in on the same node as Alice, since they share the same organization vault secret.

#### Three organizations: Orga3 decides to join

Orga3 wants to join the network and connects to Orga1. The request for approval is visible on the frontends of Orga1 and Orga2. Since both of them hold 50% of the voting power, _both_ organizations need to approve Orga3 before it can join the network. After both organizations approve Orga3, the data is synchronized and Orga3 creates a new user called Charlie. Like for the other organizations, Charlie can only login on the node of Orga3. All three organizations now hold 33.33% of the voting power in the network.

![trubudget-orga-diagramm](./img/trubudget-orga-diagramm.png)

## Further reading

If you want to read more about the concept of organizations, have a look at the [Multi Node Setup ADR](../developer/architecture/0010-multi-node-setup-and-user-management.md).

## Configuring TruBudget
Configuration in TruBudget is individual for each service. Every service as seen below uses environment variables for its configuration.


- [Blockchain](../environment-variables/blockchain-environment-variables.md)
- [API](../environment-variables/api-environment-variables.md)
- [Frontend](../environment-variables/frontend-environment-variables.md)
- [Provisioning (Optional)](https://github.com/openkfw/TruBudget/blob/main/provisioning/README.md)
- [Excel-Export (Optional)](../environment-variables/excel-export-service-environment-variables.md)
- [Email-Notification (Optional)](../environment-variables/email-notification-service-environment-variables.md)
- [Storage-Service (Optional)](../environment-variables/storage-service-environment-variables.md)

While configuring TruBudget, pay attention to environment variables used for communication between services, such as **_PORT** variables or **_IP**.

Such an example is the environment variable for setting the port of the API. While the variable is called **PORT** in the API, in another service it is called **API_PORT** and has to have the same value as the PORT variable from the API, otherwise the service won't be able to communicate with the API.

More info on setting environment variables is given below.

There are also multiple environment variables for security purposes. These are passwords/secrets for authenticating or authorizing certain services, root user (ROOT_SECRET) and organizations (ORGANIZATION_VAULT_SECRET). Make sure to double check the values when setting these variables!

## Environment variables

All installation and user guides have one thing in common: They all use environment variables to customize the setup of TruBudget. To get started, you should know about the environment variables, their purpose and how to set them.

You can find the documentation of all environmental variables in [environment-variables.md](../environment-variables.md).

If you need a `.env.example` file as a template, use the `.env.example` file in `/scripts/operation`. This file has all values pre-filled.

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

:::note
In this case we assume you use the standard command line tool for Linux/OS X (which is Bash) and Windows (which is CMD).
:::

Another option to set environment variables is to use a `.env` file in the directory where the start command is executed.
Trubudget provides a default example `.env.example` file which has to be renamed to `.env` if it should be used.
