# Introduction

This guide offers tutorials on some key features of TruBudget, such as creating a new network, connecting to an existing network or updating the TruBudget instance. 

In order to deploy and operate TruBudget, you have a few options. The most suitable option depends on the underlying infrastructure as well as what resources and technologies are available to you. The following options have been tested.

### Kubernetes
The most modern option is to deploy TruBudget on a Kubernetes cluster. We recommend using this option as it offers different benefits such as a high availability and fault tolerance (due to the existence of replica sets), as well as scalability and resource optimization. To set up TruBudget on a k8s cluster we offer helm charts and instructions in a [separate documentation file](https://github.com/openkfw/TruBudget/tree/main/helm). 

### Docker Compose
Another option commonly used to set up TruBudget is using our docker compose setup. This way, each TruBudget component will be started as a separate docker container and the persisted data will be stored using volumes.

If for some reason you can't use docker and docker compose, you can follow the bare-metal guidelines.

## Table of Contents

- Starting a new network

  - [Docker](./create-a-new-network/docker.md) (recommended)
  - [Bare-Metal](./create-a-new-network/bare-metal.md)

- Connecting to an existing network

  - [Docker](./connect-to-an-existing-network/docker.md) (recommended)
  - [Bare-Metal](./connect-to-an-existing-network/bare-metal.md)

