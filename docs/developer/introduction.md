---
sidebar_position: 1
---

# Contributing to TruBudget

Thanks for taking the time to contribute!

The following is a set of guidelines for contributing. These are mostly
guidelines, not rules. Use your best judgment, and feel free to propose changes
to this document in a pull request.

## Table of Contents

- [Contributing to TruBudget](#contributing-to-trubudget)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [How to get started with TruBudget](#how-to-get-started-with-trubudget)
  - [How to ask for support](#how-to-ask-for-support)
  - [How to contribute](#how-to-contribute)
    - [Create an issue](#create-an-issue)
    - [Open a Pull Request](#open-a-pull-request)
    - [Don't forget to update the changelog!](#dont-forget-to-update-the-changelog)
  - [Styleguides](#styleguides)
    - [Git Commits](#git-commits)
    - [Git Branches](#git-branches)
    - [Git Workflow](#git-workflow)
  - [Architecture Decisions](#architecture-decisions)
  - [Source Layout](#source-layout)
  - [Code Structure and Source Layout](#code-structure-and-source-layout)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct]. By
participating, you are expected to uphold this code. Please report unacceptable
behavior to [Jure Zakotnik], who is the current project maintainer.

## How to get started with TruBudget

If this is your first time starting TruBudget, you should follow the [Developer Setup] for setting up the project.

## How to ask for support

If you need to ask for support feel free to reach out to us on
[discussions], check out the existing [documentation] or create a new [github issue]

## How to contribute

### Create an issue

Feel free to help out if you noticed a bug or if you want to suggest a new feature by simply opening a new [github issue]

### Open a Pull Request

When working on a feature, you can open a PR in as soon as you push the first changes. Please make sure you follow these guidelines regarding PRs:

- Make sure that the PR description clearly describes what you are working on
- If aplicable, mention what issue will be closed with this pull request, by typing `Closes #issueNumber`
- Describe how you are planning on implementing the soultion, maybe by creating a TODO list
- The PR should be in draft mode if you're still making some changes. If it is ready to be reviewed then mark it as "Ready for review"

### Don't forget to update the changelog!

If you make changes that are relevant to the end user you should add an entry in the CHANGELOG.md file, which can be found in the root folder of the project. Before adding to the changelog, you should read these [guidelines]

## Styleguides

### Git Commits

When writing commits you should consider the following guidelines:

- Follow these [git commit guidelines]
- Always include a prefix in the commit message with the abbreviation of the project you're working on (api, bc, doc, UI, e2e-test, excel-export, email-service)
- When you're only changing the documentation you can include `[ci skip]` in the commit title

### Git Branches

When creating a new branch, you should consider the following guidelines regarding branch names:

- Lead with the number of the issue you are working on
- Add a short description of what the task is about
- Use hyphens as separators

### Git Workflow

To get an idea about the workflow used in our project you should read this [how to / git].
So when working on a feature branch make sure to:

1. Checkout the main branch and pull the recent changes
2. Create a new feature branch respecting the guidelines mentioned above
3. Try to keep the commits separate and respect the guidelines mentioned above. Don't squash the commits into a single one especially if you changed a lot of files
4. Push to the remote repository and open a pull request respecting the guidelines mentioned above
5. Make sure the pipelines are passing
6. Wait for a review. If you need a specific team member to review the PR you can request a review from them and assign them to the PR
7. When your feature is ready make sure you have the latest changes by running `$ git pull --rebase origin main` on your feature branch and push the changes
8. Merge the pull request into main

## Architecture Decisions

When we make a significant decision in how to write code, or how to maintain the
project and what we can or cannot support, we will document it using [Architecture
Decision Records (ADR)]. Take a look at the [doc/architecture/decisions] directory for
existings ADRs. If you have a question around how we do things, check to see if it is
documented there. If it is _not_ documented there, please ask us - chances are you're
not the only one wondering. Of course, also feel free to challenge the decisions by
starting a discussion on [GithubDiscussions] or by opening a new [github issue].

## Code Structure and Source Layout

TruBudget project consists of multiple folders under source. These folders contain code and configuration for the different layers of services or utilities. Each folder has its own README file that describes the service in more detail. For example, README file under api folder [api/README.md](https://github.com/openkfw/TruBudget/blob/main/api/README.md) describes individual environment variables that are used by the api service, how to run api as standalone and how to generate code documentation. 

We strongly advise you to read the README files in the relevant folders of the services/features you will be working on. 

Core services of TruBudget:


- [Api](https://github.com/openkfw/TruBudget/blob/main/api/README.md)
- [Blockchain](https://github.com/openkfw/TruBudget/blob/main/blockchain/README.md)
- [Frontend (UI)](https://github.com/openkfw/TruBudget/blob/main/frontend/README.md) 

Optional (business relevant) services of TruBudget:

- [Email Notification Service](https://github.com/openkfw/TruBudget/blob/main/email-notification-service/README.md)
- [Excel Export Service](https://github.com/openkfw/TruBudget/blob/main/excel-export-service/README.md)
- [Storage Service](https://github.com/openkfw/TruBudget/blob/main/storage-service/README.md)

Testing services and utilities:

- [Provisioning Service](https://github.com/openkfw/TruBudget/blob/main/provisioning/README.md)
- [End-to-End Tests](https://github.com/openkfw/TruBudget/blob/main/e2e-test/README.md)

Miscelleanous services and utilities:

- [Helm](https://github.com/openkfw/TruBudget/blob/main/helm/README.md)
- [Logging Service](https://github.com/openkfw/TruBudget/blob/main/logging-service/README.md)
- [Migration Script](https://github.com/openkfw/TruBudget/blob/main/migration/README.md)
- [Multichain Feed Script](https://github.com/openkfw/TruBudget/blob/main/multichain-feed/README.md)
- [Postman Collection](https://github.com/openkfw/TruBudget/blob/main/postman/README.md)
- [PowerBI](https://github.com/openkfw/TruBudget/blob/main/PowerBI/ReadMe.md)

- Scripts
  - [Development](https://github.com/openkfw/TruBudget/blob/main/scripts/development/README.md)
  - [Operation](https://github.com/openkfw/TruBudget/blob/main/scripts/operation/README.md)
  - Pipeline

Docs: 

- [Documentation](https://github.com/openkfw/TruBudget/blob/main/docs/README.md)

Docker:
- [Docker compose](https://github.com/openkfw/TruBudget/blob/main/docker-compose/README.md)

[github issue]: https://github.com/openkfw/TruBudget/issues
[code of conduct]: https://github.com/openkfw/TruBudget/blob/main/CODE_OF_CONDUCT.md
[jure zakotnik]: https://github.com/jzakotnik
[githubdiscussions]: https://github.com/openkfw/TruBudget/discussions
[architecture decision records (adr)]: http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions
[doc/architecture/decisions]: ./architecture/intro.md
[developer setup]: ./developer-setup.md#developer-setup/
[guidelines]: https://keepachangelog.com/en/1.0.0/
[git commit guidelines]: https://chris.beams.io/posts/git-commit/
[open a pull request]: https://github.com/openkfw/TruBudget/pulls
[how to / git]: https://gist.github.com/robertpataki/1b70e22d14ef92e1be1338314809b46e
[documentation]: https://github.com/openkfw/TruBudget/tree/main/doc
