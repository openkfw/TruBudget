# Security @ TruBudget

This document shows the security level of TruBudget via FAQ. Do not hesitate to ask a security question, so the TruBudget team can answer it and expand the FAQ - just open an issue.

## FAQ

### Why an implementation of TruBudget with Blockchain Multichain technology? What are the reasons or advantages compared to other Blockchain implementations or technologies?

Multichain is a high-performance private/permissioned blockchain technology which allows high-throughput on standard hardware. Additionally, it works well in cases of network partitions.

### Is there a standard architecture for the TruBudget Multichain Blockchain?

TruBudget was developed in a classical layered 3-tier architecture model. The TruBudget API uses the Hexagonal Architecture Standard. Communication uses HTTP over JSON API Standards and the Frontend uses the Atomic Design Principles.

### What are the reasons that justify TruBudget becoming an OPEN solution? In terms of security, isn't there a risk?

Open-Sourcing allows multiple parties to use TruBudget without procuring the software (which is a timely exercise). Open-Source is at no costs. From a security perspective open-sourcing is making development more transparent and required automatically a higher level of quality. TruBudget enforces modern Security Standards and all necessary secrets have to be set at Runtime.

### What processes are implemented in TruBudget and what are the different possible applications?

In general, all processes important to more than 1 stakeholder/business partner may be carried out on TruBudget.

#### Examples

- Request to sign a contract by stakeholder A – Upload of signed contract by stakeholder B
- Request to approve a report by A – Upload of approved report by B
- Request to give no-objection to tender documents by A– Documented no-objection by B
- Payment documented by A – Confirmation of receipt by B.
- Information by A – Validation by B.

Internal processes are not supposed to be part of TruBudget as it is a multi-stake-holder tool. TruBudget is very flexible in regard to the applied processes. In each use case the stakeholders will decide on relevant processes to be put on TruBudget in order to facilitate their joint business.

### Is data confidentiality taken into account in TruBudget? If yes, how?

Data confidentiality is guaranteed on API level. Users need to be authenticated and authorized in order to request data from the API based on a role-base access model. Data at rest (in the blockchain) is visible to persons with access to production server.

### In terms of application security, does TruBudget integrate the concept of multi- signature?

No. Transactions are signed with the user’s private key which is related to an organizational wide secret. Transactions can only be signed on nodes of the user’s organization. Multiple signing is possible, but not implemented (e.g. 4 eyes principle). However, within an organization writing rights on TruBudget may be organized according to internal requirements (e.g. internal approvals before entering data).

### What security measures or mechanisms are planned for TruBudget's interface with other business applications?

Given that the proper functioning of TruBudget is linked to existing tools and their interfaces TruBudget exposes a secured API. Access to the API is secured with JWT Token (1 day validity). The tokens can be obtained using Basic Auth through a Login endpoint.

### What are the benefits of TruBudget in terms of ergonomics, ease of use, ease of access, user interfaces?

- no double entries of data
- data are generated while working on processes
- all stakeholders use same data, no need to compare data
- automatic exchange of data will replace cumbersome reports
- validated data will improve quality of data-based planning and reporting
- access to high quality data at any time in real-time
- user interface easy to use, limited training needs for users
- web-based application, no need for hardware investments
- no need to change current IT systems (as TruBudget is linked via API)
- API linkage to stakeholders’ IT systems allows use through own ERP instead of
  TruBudget user interface

### How could exchange channels be encrypted?

On node-level communication needs to be ensured through VPN or with the use of Multichain Enterprise. On API level communication is encrypted using TLS.

### Is the TruBudget Multichain Blockchain auditable? Is it possible to follow the proper functioning of the TruBudget Multichain Blockchain? Is it possible to read the transactions? If yes, how?

Yes, every change is stored in an immutable transaction and can’t be deleted. The transactions can be accessed through TruBudget’s history functionality or by using the low-level Multichain API “getBlock”.

### What are the constraints or requirements for deploying the TruBudget Multichain Blockchain: network interconnection technology between nodes, speed, bandwidth, platforms (Windows, Linux, MacOS), resources (Processor, memory, hard disk space)?

The requirements can be found in the [installation guide](../tutorials/installation/bare-metal-installation.md).

### What is the maximum number of nodes that TruBudget can support?

There is no realistic limitation here.

### What are the requirements for integrating Nodes into TruBudget?

There are two ways Nodes can join the TruBudget network:

- A node of a new organization wants to join
- A node of an existing organization wants to join

In both cases a certain number of organizations in the network has to approve the new node. The difference is that a new organization needs 51% of all organizations in the network and a new node of an existing organization only needs one approval. More about how to connect a new node to an existing network can be found in the [documentation](../tutorials/connect-to-network/connect-docker-compose.md).

### Given that third party organizations who manage blockchain nodes are required to comply with the same security standards, what is the security policy or security measures applicable to the nodes to be integrated into TruBudget in terms of security governance (governance model, node control process), regulatory requirements, prevention (data protection, application protection, identity protection, infrastructure protection), resilience?

First of all, internal systems can’t be accessed through other TruBudget instances/ nodes. Data can be accessed directly through the multichain-cli available on TruBudget’s node instance or through TruBudget’s API. Direct access to a node should be restricted by the organization itself. Access using the routes of TruBudget’s API is protected by user authorization through JSON Web Tokens. There are 3 different secrets which an organization must provide to setup a new node:

- `RPC_PASSWORD`: Additionally, an API can only connect to a node in the network knowing the right `RPC_PASSWORD` which is set by the first node (master node) of the blockchain network.
- `ORGANIZATION_VAULT_SECRET`: Every node belongs to an organization which has its own stream on the multichain. The data in this stream can only be accessed through the node which belongs to this organization using the `ORGANIZATION_VAULT_SECRET`. This secret is shared between all nodes of one organization.
- `ROOT_SECRET`: The root secret is the password for the root user. If you start with an empty block-chain, the root user is needed e.g. to add other users or approve new nodes.

### Is TruBudget suitable for large-scale deployment? Is it scalable?

TruBudget scales horizontally and is therefore easily scalable by adding multiple instances.

### How are latency, optimization and QOS issues taken into account in TruBudget?

TruBudget uses in-memory caching strategies in order to ensure low latency for read operations.

### How Fork problems are managed at TruBudget level?

The longer chain wins: Transactions in the shorter branch re-enter the memory pool of nodes, which leaves them in the regular situation of waiting for confirmation, but being visible to all nodes. The only exception is if some of those transactions conflict with transactions which are already confirmed on the longer branch, or already in the memory pool, in which case they are discarded.

### Why the choice of Round Rip consensus for TruBudget?

In private/permission-less networks there is no need for Proof-of-Work algorithms. Round robin allows high throughput with acceptable security. The consensus algorithm can be configured if required.

### What is the number of transactions per second allowed in TruBudget?

The bottleneck of TruBudget is Multichain. The number of transactions per second are depending on the hardware. On standard hardware TruBudget can allow 2000 transactions per second.

### As the size of the blockchain may change over time, can we not fear a risk of TruBudget malfunctioning?

Data-volume stored on the chain is very small. On system with large disks, TruBudget can run for a very long time. As example: the provisioning of TruBudget available in the github repository of TruBudget is generating test data which currently includes 7 users and 4 projects on one node. After provisioning a fresh installed TruBudget chain is completed the chain size increases by 2MB.
In case that disk usage exceeds disk capacity TruBudget could fulfil time-based partitioning where old data is archived and current/new data is transferred to a new TruBudget instance.

### Apart from the security aspects inherent to the Blockchain such as transparency, traceability, integrity, what are the security mechanisms or protocols implemented in TruBudget? From the frontend to the back end?

Communication between Frontend and API is encrypted using TLS and restricted to authenticated and authorized users. The API validates requests and enforces role-base-access rights for every resource. Access from the API to the chain is encrypted using TLS and secured using a shared secret. Communication between blockchain nodes is done using TCP and has to be secured using VPN.

### Generally, in the design and development of Blockchain solutions, regulatory requirements (privacy requirements such as data confidentiality, right to forget and deletion of data) and compliance requirements can be integrated. What about TruBudget? Since the different nodes are not subject to the same regulations, how is this taken into account in TruBudget?

TruBudget is designed to be as generic as possible which means that no restrictions shall be forced where it isn’t needed. However, since data can’t be removed from the blockchain, users should be drawn attention to not enter personal data which is stored on-chain. That regards only the choice of user names, name of projects, sub-projects and workflow-items.
Currently emails typed into a user’s profile and documents are not saved on-chain and may therefore contain personal data if required and permitted according to respective regulations. Emails are saved in a local database and not replicated through the blockchain therefor they can be deleted if required. For saving documents multichain’s off-chain-storage is used which means documents are shared but can technically be deleted.

### Updating the TruBudget version of the blockchain (connected nodes) implies updating TruBudget on the individual nodes. What mechanism is provided so that this update is effective on all nodes simultaneously so that there are no different versions of TruBudget on the servers?

TruBudget versions are backwards compatible, which means different versions of TruBudget can run in the same network. There are strategies in place for breaking versions which will automatically enforce nodes with older versions to update to a newer version.

### The params.dat configuration file containing all the multichain TruBudget configuration. What protection measures are implemented to prevent the multichain parameters and permissions contained in this file from being modified for malicious purposes?

Access to production infrastructure needs to be secured by the operation team. The security relevant configurations like consensus requirements can’t be changed after the first block was mined.
