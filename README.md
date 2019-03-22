# TruBudget-App

[![build status](https://travis-ci.com/openkfw/TruBudget.svg?branch=master)](https://travis-ci.com/openkfw/TruBudget)
[![gitter chat](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/Tru-Community/community)

## Getting Started

There are two options to run TruBudget either using the local sources or running the latest stable docker images.

First, you need to create a parameters file:

```bash
cd path/to/trubudget-app
cp .env_example .env
```

Now open the file and do your changes. Make sure you set `ORGANIZATION` to your organization name (best not to use spaces), and `ORGANIZATION_VAULT_SECRET` and `ROOT_SECRET` to secret phrases that only people in your organization know.

For running TruBudget you have two options: you can either use existing images or your local checkout.

### Stable Docker Images

Since running existing, tested images is generally more stable and also quicker, this is the recommended way to run TruBudget. Note that for accessing the image registry you'll need to put your registry password into a file called `DOCKER_REGISTRY_PASSWORD` in the checkout's root directory (i.e., where the `.env` files resides).

```bash
sh scripts/master/start-master-node.sh
```

Additionally, make sure that the `.env` file contains the `TAG` variable set to the version you're going to run, for example: `TAG=v1.0.0-beta.3`.
If you run into any issues check out the [Installation Guide](./doc/wiki/Installation-Guide/Installation-Guide.md) for more detailed information.

### Local Sources

If you don't have the registry password yet, or if you want to test local modifications, you can also run TruBudget from disk:

```bash
sh scripts/local/start-master-node.sh
```

If you run into any issues check out the [Installation Guide](./doc/wiki/Installation-Guide/Installation-Guide.md) for more detailed information.

## More Information

Check out our [**Trubudget-Wiki**](./doc/README.md) to find out how Trubudget works.

## FAQ

| Description           | Link                                                                                                              |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------- |
| How to run e2e-tests? | https://github.com/openkfw/TruBudget/blob/master/doc/wiki/Contributer-Guide/Contributer-Guide.md#end-to-end-tests |
| How to run unit-test? | https://github.com/openkfw/TruBudget/blob/master/doc/wiki/Contributer-Guide/Contributer-Guide.md#unit-tests       |
