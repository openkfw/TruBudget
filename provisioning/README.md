# TruBudget Provisioning

The provisioning project creates a bunch of test data via api requests.

## Environment Variables

| Env Variable     | Default Value | Description                                                                                                                                                                                                                                                                   |
| ---------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ENVIRONMENT_TYPE | TEST          | If set to PROD the prod environment is provisioned otherwise the test environment is used                                                                                                                                                                                     |
| API_HOST         | localhost     | IP address of the api                                                                                                                                                                                                                                                         |
| API_PORT         | 8080          | Port of the api                                                                                                                                                                                                                                                               |
| ROOT_SECRET      | asdf          | The root secret is the password for the root user. If you start with an empty blockchain, the root user is needed to add other users, approve new nodes,.. If you don't set a value via the environment variable, the API generates one randomly and prints it to the console |
| ORGANIZATION     | -             | In the blockchain network, each node is represented by its organization name. This environment variable sets this organization name. It is used to create the organization stream on the blockchain and is also displayed in the frontend's top right corner.                 |

## Setup

Initialize a newly created TruBudget node (MultiChain + API) with data. The script can handle multiple environments, which can be defined using JSON files in `src/data/<ENVIRONMENT>/` and selected using the environment variable `ENVIRONMENT_TYPE`.

First, install the dependencies:

```bash
npm install
```

Then run the script. You need to supply the `ORGANIZATION` and the `ROOT_SECRET` as configured with the API. Using the `test` environment:

```bash
ORGANIZATION=myorga ROOT_SECRET=my-secret npm start
```

Alternatively, use it to provision the `prod`uction data:

```bash
ORGANIZATION=myorga ROOT_SECRET=my-secret ENVIRONMENT_TYPE=PROD npm start
```

By default, the script expects the API to listen on `127.0.0.1:8080`, but this can be customized using the `API_HOST` and `API_PORT` environment variables.
