# Installation Guide <!-- omit in TOC -->

This document describes how to set up your environment to start developing and debugging the TruBudget application. The first section describes the recommended tools for development, the second part is dedicated to the installation on your local machine for development and debugging.

There are different ways to install Trubudget. Since running existing, tested images is generally more stable and also quicker, docker-compose is the recommended way to run TruBudget.

- [Running via Docker Compose](#running-via-docker-compose)
- [Local Installation](#local-installation)
- [Using Helm to deploy on Kubernetes](#using-helm-to-deploy-on-kubernetes)

# Requirements <!-- omit in TOC -->

| Component        |   Minimum Requirement |
| ---------------- | --------------------: |
| CPU              |          2 x x86 2GHz |
| RAM              |                  8 GB |
| Disk space       |                 50 GB |
| Operating system | Ubuntu 16.04 or above |

# Running via Docker Compose

- [Docker Compose](./Installation/Docker-compose.md)

# Local Installation

- [Local Installation](./Installation/Local-Installation.md)

# Using Helm to deploy on Kubernetes

Use the [Helm chart](../../../helm/README.md) to deploy TruBudget to Kubernetes.