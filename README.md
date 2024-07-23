# TruBudget <!-- omit in TOC -->

![BuildStatus](https://github.com/openkfw/TruBudget/actions/workflows/github-ci.yml/badge.svg)
![DocumentationBuildStatus](https://github.com/openkfw/TruBudget/actions/workflows/update-documentation.yml/badge.svg)

# Introduction

TruBudget - a trusted public expenditure tool. A collaborative workflow tool and secured platform to track and coordinate the implementation of donor-funded investment projects.

To fully understand the idea and motivation behind Trubudget, watch following video: <https://www.youtube.com/watch?v=rnTsPjhTVj0>

If you have any questions refer to the [Frequently Asked Questions (FAQ)](#frequently-asked-questions) section below or [start a new discussion](https://github.com/openkfw/TruBudget/discussions/new)

## Getting started

### Trubudget as a Service

If you want to try out TruBudget, we serve an as a service solution. Register for TruBudget as a Service and dive straight into a TruBudget sandbox: [taas.trubudget.net](https://taas.trubudget.net/)

### Trubudget on your machine

If you want to try out TruBudget locally, you need to install [Docker](https://www.docker.com/community-edition#/download).

For a very **quick and easy** TruBudget setup, run:

```bash
cp scripts/operation/.env.example scripts/operation/.env
bash scripts/operation/start-trubudget.sh --slim
```

More information for the operation setup can be found in the [README.md](./scripts/operation/README.md)

It may take a while to build and start all containers. The frontend should then be available at <http://localhost:3000>.

## Installation

TruBudget can be installed in different ways. See [README.md](./docs/operation-administration/installation/README.md) for more information.

## Documentation

Check out our documentation on the [**Trubudget-Website**](https://openkfw.github.io/trubudget-website/docs/) to find out how Trubudget works.

## Contributing

Main reasons for open sourcing Trubudget are

1. Transparency
1. fork the project / Publish a base blockchain project for workflow processes to enabled
1. Building up a community

Read below to learn how you can take part in improving Trubudget.

### Code of Conduct

KfW has adopted a [Code of Conduct](./CODE_OF_CONDUCT.md) that we expect project participants to adhere to. Please read the full text so that you can understand what actions will and will not be tolerated.

### Contributing Guide

Read our [Contributing Guide](./.github/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to Trubudget.

### Good First Issues

To help you get started as a contributor, we have a [list](https://github.com/openkfw/TruBudget/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) of good first issues that contain bugs which have a relatively limited scope.

## Frequently Asked Questions

- Can it be done without blockchain?

If it could, it would have been done already. The blockchain in this use case solves the problem of an integration
architecture between several parties, which is not owned by a single participant.

- Why don‘t you use a SharePoint?

In theory a good idea. However, you have to agree, who should host the SharePoint. Should it be the donor? Which one in a multi-donor situation? Or should it be the partner? Do we trust the party who owns the SharePoint? Lots of open questions.

- Why don‘t you use a cloud service by a 3rd party provider (google, amazon, ..)

Two reasons: Not everyone is ready to go to a cloud. Moreover, the cloud provider is paid by someone – who should this be? It
is difficult to find a truly independent 3rd party provider.

- Is the blockchain consuming lots of energy, like Bitcoin?

No it‘s not, since the consensus algorithm is configurable and configured to round-robin instead of proof-of-work

- Is the KfW responsible for development and operation of TruBudget nodes?

No, each organization is responsible for the hosting of their TruBudget installation. All participants in the network agree on which data/semantics will be shared in the cooperation. The KfW is contributing to the respective open source solution, under the GNU General Public License v3.0.

- How do you handle GDPR (DSGVO) if data cannot be deleted?

Data that is relevant for GDPR (e.g. personal data) should be stored off-chain.

## License

Trubudget is [GNU GENERAL PUBLIC](./LICENSE) licensed.

TruBudget is a workflow engine therefore does not contain any relevant data to GDPR. If relevant data is collected, the organizations using the software have to ensure that the data is appropriately encoded or stored.
