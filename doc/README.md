# TruBudget Documentation

> For the **latest release**, the **Getting Started** section or the **FAQ** visit our initial [README.md](https://github.com/openkfw/TruBudget/blob/master/README.md)

Welcome to the TruBudget documentation! This guide aims to provide you with information about the different parts of TruBudget.

[Readme](https://github.com/openkfw/TruBudget/blob/master/README.md) - Introduction and first example

[Introduction](./Introduction.md) - Some basics of TruBudget

- [Environment Variables](./Introduction.md#environment-variables)
- [Organizations and Nodes](./Introduction.md#organizations-and-nodes-in-trubudget)

[Tutorials](./tutorials) - Guides to get started with running TruBudget

- [Installation](./tutorials/installation/)
- [Starting a new network](./tutorials/create-new-network)
- [Connecting to existing network](./tutorials/connect-to-network)
- [Developer setup](./tutorials/contribute/Contributor-Guide.md)

[User Guide](./wiki/User-Guide/README.md) - How to interact with TruBudget via the frontend

- [Projects/Subprojects/Workflowitems](./wiki/User-Guide/Projects)
- [Users and Groups](./wiki/User-Guide/Users-Groups)
- [Network](./wiki/User-Guide/Network)
- [Backup](./wiki/User-Guide/Backup.md)
- [Notifications](./wiki/User-Guide/Notifications.md)
- [Permissions](./wiki/User-Guide/Permissions.md)
- [Versions](./wiki/User-Guide/Versions.md)

[Logging](./logging/README.md) - Informations on the API log and how to handle it

[Troubleshooting](./troubleshooting/README.md) - How to solve known issues

[Security](./security/README.md) - Information on the security aspects of Trubudget

[FAQ](./wiki/User-Guide/README.md#faq) - Frequently asked questions

### Architecture Decision Records

An architectural decision record (ADR) is a document that captures an important architectural decision made along with its context and consequences.
For more information about what an ADR is visit the [architecture_decision_record-project](https://github.com/joelparkerhenderson/architecture_decision_record) on github.

Following table shows a list of TruBudget's ADRs:

| Title                                         | Link                                                                                     |
| :-------------------------------------------- | :--------------------------------------------------------------------------------------- |
| Record Architecture Decisions (ADRs)          | [0001-record-architecture-decisions.md](adr/0001-record-architecture-decisions.md)       |
| Access Control Model/Authorization            | [0002-access-control-model.md](./adr/0002-access-control-model.md)                       |
| Project Data Model                            | [0003-project-data-model.md ](./adr/0003-project-data-model.md)                          |
| Resource (e.g.,Project,Subproject) Lifetime   | [0004-ressource-level-lifetime.md](./adr/0004-ressource-level-lifetime.md)               |
| Workflowitem Ordering                         | [0005-workflowitem-ordering.md](./adr/0005-workflowitem-ordering.md)                     |
| Multi Node Setup (Superceded)                 | [0006-multi-node-setup.md](./adr/0006-multi-node-setup.md)                               |
| Basic Execution Architecture                  | [0007-execution-architecture-overview.md](./adr/0007-execution-architecture-overview.md) |
| Git Branching/Releasing Model                 | [0008-git-branching-model.md](./adr/0008-git-branching-model.md)                         |
| Multichain Migration Model                    | [0009-migration-model.md](./adr/0009-migration-model.md)                                 |
| Multi Node Setup/Address Private Key Handling | [0010-multi-node-setup.md](./adr/0010-multi-node-setup.md)                               |
