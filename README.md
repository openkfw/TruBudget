# TruBudget <!-- omit in TOC -->

<!-- TODO add some badges -->

# Introduction

TruBudget - a trusted public expenditure tool. A collaborative workflow tool and secured platform to track and coordinate the implementation of donor-funded investment projects.

To fully understand the idea and motivation behind Trubudget, watch following video: https://www.youtube.com/watch?v=rnTsPjhTVj0

If you have any questions refer to the [Frequently Asked Questions (FAQ)](#frequently-asked-questions) section below or [start a new discussion](https://github.com/openkfw/TruBudget/discussions/new)

## Installation

Trubudget can be installed in different ways. Choose your prefered installation guide:

- [Install using Docker/Docker-Compose](./doc/installation/README.md#docker)
- [Install bare metal](./doc/installation/README.md#bare-metal)

## Documentation

Check out our [**Trubudget-Wiki**](./doc/README.md) to find out how Trubudget works.

## Contributing

Main reasons for open sourcing Trubudget are

1. Transparency
1. fork the project / Publish a base blockchain project for workflow processes to enabled
1. Building up a community

Read below to learn how you can take part in improving Trubudget.

Code of Conduct
KfW has adopted a Code of Conduct that we expect project participants to adhere to. Please read the full text so that you can understand what actions will and will not be tolerated.

Contributing Guide
Read our contributing guide to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to Trubudget.

Good First Issues
To help you get started as a contributor, we have a list of good first issues that contain bugs which have a relatively limited scope.

## Frequently Asked Questions

- Can it be done without blockchain?

If it could, it would have been done already. The blockchain in this use case solves the problem of an integration
architecture between several parties, which is not owned by a single participant.

- Why don‘t you use a Sharepoint?

In theory a good idea. However, you have to agree, who shoud host the Sharepoint. Should it be the donor? Which one in a multi-donor situation? Or should it be the partner? Do we trust the party who owns the sharepoint? Lots of open questions.

- Why don‘t you use a cloud service by a 3rd party provider (google, amazon, ..)

Two reasons: Not everyone is ready to go to a cloud. Moreover, the cloud provider is paid by someone – who should this be? It
is difficult to find a truly independent 3rd party provider.

- Is the blockchain consuming lots of energy, like Bitcoin?

No it‘s not, since the consensus algorithm is configurable and configured to round-robin instead of proof-of-work

- Is the KfW responsible for development and operation of TruBudget nodes?

No, each organization is responsible for the hosting of their TruBudget installation. All participants in the network agree on which data/semantics will be shared in the cooperation. The KfW is contributing to the respective open source solution, under the GNU General Public License v3.0.

- How do you handle GDPR (DSGVO) if data cannot be deleted?

Data that is relevant for GDPR (e.g. personal data) is stored off-chain

## License

Trubudget is [GNU GENERAL PUBLIC](./LICENSE) licensed.
