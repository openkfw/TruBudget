---
sidebar_position: 8
---

# Git Branching Model

Date: 29/08/2018

## Status

Accepted

## Context

Currently, branches are used to draft releases. Going forward, the branching model needs to satisfy the following criteria:

- Releases need to be tagged to ensure that, given a release name, the commit sha can be inferred.
- We need to support multiple networks (chains), but they are not necessarily running the same version of TruBudget.
- Each network should have its own deployment URL that does not change on non-breaking version updates.
- Conversely, in case of breaking changes, the deployment URL should be changed.

## Decision

- `main` continues to be the main development branch.

- Releases are tagged using an [annotated Git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging) (optionally [signing the tag](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)) like this:

```bash
git tag -a "v2.0.0-beta.1" -m "version 2.0.0-beta.1"
```

- For each network, there is a Git branch prefixed by the major version the network is running on - **major version upgrades are assumed to break compatibility with the network**. For example, branch names may look like this:

```plain
1.x.x_my-example-network
1.x.x_my-other-example-network
2.x.x_network-running-a-newer-version
```

Note that a branch `1.x.x_ACMECorp-UmbrellaCorp` that is running tag `v1.0.0` may upgrade to a newer minor version like `v1.1.0`, but cannot upgrade to a `2.x` release. If the ACMECorp and the UmbrellaCorp decide to upgrade to the `2.x` series of TruBudget, they need to migrate to a new branch called `2.x.x_ACMECorp-UmbrellaCorp`. The definition of the necessary processes is not in scope of this ADR.

Additionally, there is one release branch for each major version that tracks the most current release (tag) for that major version.

The steps required for making a new release are:

1. Increase the version number (see #33).
1. Update the CHANGELOG.md file to reflect the release.
1. Tag the commit on the main branch (see above).
1. Checkout the release branch of the current major version (e.g. `release_1.x.x`) and `git merge main`.

As soon as a network is ready to be upgraded to the new version, its branch may be updated:

1. Checkout the network branch, e.g. `1.x.x_my-example-network`.
1. Merge-in the release branch (or a specific tag), e.g. `git merge release_1.x.x`.

## Consequences

- The Git history shows when a release happened and who released it. Also, there is no
  confusion between releases and branches.
- The URL stays the same as long as all nodes in the network are compatible with each other. The URL does change, however, for changes that break compatibility among nodes in the network, as this warrants a new major version number.
- It is straightforward to roll out updates to different networks running the same major version of TruBudget.
