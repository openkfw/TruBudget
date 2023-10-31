# TruBudget Provisioning

The provisioning project creates a bunch of test data via api requests.

## Environment Variables

| Env Variable      | Default Value | Description                                                                                                                                                                                                                                                                   |
| ----------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PROVISIONING_TYPE | TEST          | If set to PROD the prod data is provisioned otherwise the test data is used                                                                                                                                                                                                   |
| API_HOST          | localhost     | IP address of the api                                                                                                                                                                                                                                                         |
| API_PORT          | 8080          | Port of the api                                                                                                                                                                                                                                                               |
| ROOT_SECRET       | root-secret   | The root secret is the password for the root user. If you start with an empty blockchain, the root user is needed to add other users, approve new nodes,.. If you don't set a value via the environment variable, the API generates one randomly and prints it to the console |
| ORGANIZATION      | -             | In the blockchain network, each node is represented by its organization name. This environment variable sets this organization name. It is used to create the organization stream on the blockchain and is also displayed in the frontend's top right corner.                 |
| LOG_LEVEL         | info          | Defines the log output. Supported levels are `trace`, `debug`, `info`, `warn`, `error`, `fatal`                                                                                                                                                                               |

## Setup

Initialize a newly created TruBudget node (MultiChain + API) with data. The script can handle multiple environments, which can be defined using JSON files in `src/data/<ENVIRONMENT>/` and selected using the environment variable `PROVISIONING_TYPE`.

First, install the dependencies:

```bash
npm install
```

Then run the script. You need to supply the `ORGANIZATION` and the `ROOT_SECRET` as configured with the API. Using the `test` data:

```bash
export ORGANIZATION=myorga
export ROOT_SECRET=my-secret
export PROVISIONING_TYPE=TEST
npm start
```

Alternatively, use it to provision the `prod`uction data:

```bash
export ORGANIZATION=myorga
export ROOT_SECRET=my-secret
export PROVISIONING_TYPE=PROD
npm start
```

By default, the script expects the API to listen on `127.0.0.1:8080`, but this can be customized using the `API_HOST` and `API_PORT` environment variables.

## Provisioning data

The default provisioning data is stored in `provisioning/src/data/test`.

| Login ID   | Name           | Group  | Password |
| ---------- | -------------- | ------ | -------- |
| mstein     | Mauro Stein    | admins, reviewers | test     |
| jdoe       | John Doe       | admins | test     |
| thouse     | Tom House      |        | test     |
| pkleffmann | Piet Kleffmann |   reviewers | test     |
| jxavier    | Jane Xavier    |   reviewers | test     |
| dviolin    | Dana Violin    |        | test     |
| auditUser  | Romina Checker |        | test     |


 Source of the provisioning data are the JSON Objects which can be found [here](https://github.com/openkfw/TruBudget/tree/main/provisioning/src/data/test). New provisioning data can be added or the existing ones can be modified through the JSON objects.
 
> All fields which are already present in the JSON objects are mandatory. Deleting these fields will fail the provisioning.
 
