# Contributing to TruBudget

Thanks for taking the time to contribute!

The following is a set of guidelines for contributing. These are mostly
guidelines, not rules. Use your best judgment, and feel free to propose changes
to this document in a pull request.

## Table of Contents

- [Contributing to TruBudget](#contributing)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [How to get started with TruBudget](#how-to-get-started-with-TruBudget)
  - [How to ask for support](#how-to-ask-for-support)
  - [How to contribute](#how-to-contribute)
    - [Create an issue](#create-an-issue)
    - [Open a Pull Request](#open-a-pull-request)
    - [Don't forget to update the changelog!](#don't-forget-to-update-the-changelog!)
  - [Styleguides](#styleguides)
    - [Git Commits](#git-commits)
    - [Git Branches](#git-branches)
  - [Architecture Decisions](#architecture-decisions)
  - [Source Layout](#source-layout)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct]. By
participating, you are expected to uphold this code. Please report unacceptable
behavior to [Jure Zakotnik], who is the current project maintainer.

## How to get started with TruBudget

If this is your first time starting TruBudget, you should follow the [Developer Setup] for setting up the project.

## How to ask for support

If you need to ask for support feel free to reach out to us on
[Gitter], check out the existing [documentation] or create a new [github issue]

## How to contribute

### Create an issue

Feel free to help out if you noticed a bug or if you want to suggest a new feature by simply opening a new [github issue]

### Open a Pull Request

When working on a feature, you can open a PR in as soon as you push the first changes. Please make sure you follow these guidelines regarding PRs:

- Make sure that the PR description clearly describes what you are working on
- If applicable, mention what issue will be closed with this pull request, by typing `Closes #issueNumber`
- Describe how you are planning on implementing the solution, maybe by creating a TODO list
- The PR should be in draft mode if you're still making some changes. If it is ready to be reviewed then mark it as "Ready for review"

### Don't forget to update the changelog!

If you make changes that are relevant to the end user you should add an entry in the CHANGELOG.md file, which can be found in the root folder of the project. Before adding to the changelog, you should read these [guidelines]

## How to merge pull requests from forks

Since open source developer need to fork TruBudget to change the code and open a Pull Request to merge their changes into the openkfw/TruBudget repository, we need to add their forked repo to our local git repos. Then we can make review changes and push them back to their Pull Request.

To do this in git, run:

git remote add protected_repo https://github.com/theirusername/their_repo.git
git fetch protected_repo
git checkout protected_repo/branch_name
git switch -c branch_name_for_our_repo

After this commands, we have copied the branch from the contributors repo to the openkfw/TruBudget repo.

## Styleguides

### Git Commits

When writing commits you should consider the following guidelines:

- Follow these [git commit guidelines]
- Always include a prefix in the commit message with the abbreviation of the project you're working on (api, bc, doc, UI, e2e-test, excel-export, email-service, storage-service)
- When you're only changing the documentation you can include `[ci skip]` in the commit title

### Git Branches

When creating a new branch, you should consider the following guidelines regarding branch names:

- Lead with the number of the issue you are working on
- Add a short description of what the task is about
- Use hyphens as separators

### Git Workflow

So when working on a feature branch make sure to:

1. Checkout the main branch and pull the recent changes
2. Create a new feature branch respecting the guidelines mentioned above
3. Try to keep the commits separate and respect the guidelines mentioned above. Don't squash the commits into a single one especially if you changed a lot of files
4. Push to the remote repository and open a pull request respecting the guidelines mentioned above
5. Make sure the pipelines are passing
6. Wait for a review. If you need a specific team member to review the PR you can request a review from them and assign them to the PR
7. When your feature is ready make sure you have the latest changes by running `$ git pull --rebase origin main` on your feature branch and push the changes
8. Merge the pull request into main

### Code Documentation

During development, make sure you document code additions or modifications in the API using code docs. Some guidelines on how this is done can be found in [this article](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html). All functions, interfaces, enums and important constants should contain code docs. By default, exported members will be visible in the [TruBudget official documentation](https://trubudget.net/docs). If you also want not exported members to be included in the documentation, this can be achieved using the `@notExported` tag provided by [this plugin](https://github.com/tomchen/typedoc-plugin-not-exported).

## Architecture Decisions

When we make a significant decision in how to write code, or how to maintain the
project and what we can or cannot support, we will document it using [Architecture
Decision Records (ADR)]. Take a look at the [doc/architecture/decisions] directory for
existing ADRs. If you have a question around how we do things, check to see if it is
documented there. If it is _not_ documented there, please ask us - chances are you're
not the only one wondering. Of course, also feel free to challenge the decisions by
starting a discussion on [Gitter] or by opening a new [github issue].

## Source Layout

Best practices and layout is documented in README files next to the source files they
describe. For example, take a look at [api/src/](api/src/) to get started.

[github issue]: https://github.com/openkfw/TruBudget/issues
[code of conduct]: https://github.com/openkfw/TruBudget/blob/main/CODE_OF_CONDUCT.md
[jure zakotnik]: https://github.com/jzakotnik
[gitter]: https://gitter.im/Tru-Community/community
[architecture decision records (adr)]: http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions
[doc/architecture/decisions]: doc/architecture/decisions/
[developer setup]: https://github.com/openkfw/TruBudget/blob/main/docs/developer/developer-setup.md#developer-setup/
[guidelines]: https://keepachangelog.com/en/1.0.0/
[git commit guidelines]: https://chris.beams.io/posts/git-commit/
[open a pull request]: https://github.com/openkfw/TruBudget/pulls
[documentation]: https://github.com/openkfw/TruBudget/tree/main/docs
