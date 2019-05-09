# Installing TruBudget Directly on a Machine

The following section describes how to install the software needed to run TruBudget directly on Debian/Ubuntu/Fedora machines without the use of Docker, Docker-Compose or Kubernetes (also called _installing bare metal_).

This guide will setup the following components:

- **Blockchain**: a MultiChain Blockchain node
- **API**: a microservice serving as interface to connect to the Blockchain
- **Frontend**: a web application connected to the API displaying the data of the Blockchain

If you decide to use more than one virtual machines, execute the commands only on the machine where the component is supposed to run.

## Table of Contents

- [Installing TruBudget Directly on a Machine](#installing-trubudget-directly-on-a-machine)
  - [Table of Contents](#table-of-contents)
    - [Install of Software](#install-of-software)
  - [Known Issues](#known-issues)

### Install of Software

Execute the following commands as administrator to install Node.js, Multichain, curl, nginx and git:

Debian/Ubuntu:

```bash
sudo su
apt-get update

apt-get install -y wget git nginx curl && curl -sL https://deb.nodesource.com/setup_10.x | bash - && apt-get install -y nodejs \
    && cd /tmp \
    && wget --no-check-certificate https://www.multichain.com/download/multichain-2.0.1.tar.gz \
    && tar -xvzf multichain-2.0.1.tar.gz \
    && cd multichain-2.0.1 \
    && mv multichaind multichain-cli multichain-util /usr/bin \
    && cd /tmp \
    && rm -Rf multichain* \
    && apt-get clean \
    && cd
```

Fedora:

```bash
yum install -y wget git nginx curl && curl --silent --location https://rpm.nodesource.com/setup_10.x | bash - && yum install -y nodejs \
    && cd /tmp \
    && wget --no-check-certificate https://www.multichain.com/download/multichain-2.0.1.tar.gz \
    && tar -xvzf multichain-2.0.1.tar.gz \
    && cd multichain-2.0.1.tar.gz \
    && mv multichaind multichain-cli multichain-util /usr/bin \
    && cd /tmp \
    && rm -Rf multichain* \
    && cd
```

## Known Issues

For the solution to known issues, please see the [Known Issues page](Known-Issues.md).
