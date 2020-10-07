# TruBudget-API

## Environment Variables

| Env Variable                  | Required | Default Value | Description                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------- | -------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LOG_LEVEL                     | no       | INFO          | Sets the lowest level to the pino logger that is printed to `STDOUT` with varying levels ranging from `trace` to `fatal`.                                                                                                                                                                                                                                                         |
| ORGANIZATION                  | yes      | -             | In the blockchain network, each node is represented by its organization name. This environment variable sets this organization name. It is used to create the organization stream on the blockchain and is also displayed in the frontend's top right corner.                                                                                                                     |
| ORGANIZATION_VAULT_SECRET     | yes      | -             | This is the key to en-/decrypt user data of an organization. If you want to add a new node for your organization, you want users to be able to log in on either node. <br>**Caution:** If you want to run TruBudget in production, make sure NOT to use the default value from the `.env_example` file!                                                                           |
| PORT                          | no       | 8080          | The port used to expose the API for your installation. <br>Example: If you run TruBudget locally and set API_PORT to `8080`, you can reach the API via `localhost:8080/api`.                                                                                                                                                                                                      |
| PRETTY_PRINT                  | no       | true          | Decides whether the logs printed by the API are pretty printed or not. Pretty printed logs are easier to read while non-pretty printed logs are easier to store and use e.g. in the ELK (Elasticsearch-Logstash-Kabana) stack.                                                                                                                                                    |
| ROOT_SECRET                   | no       | [random]      | The root secret is the password for the root user. If you start with an empty blockchain, the root user is needed to add other users, approve new nodes,.. If you don't set a value via the environment variable, the API generates one randomly and prints it to the console <br>**Caution:** If you want to run TruBudget in production, make sure to set a secure root secret. |
| RPC_HOST                      | no       | localhost     | The IP address of the blockchain (not multichain daemon,but they are usally the same) you want to connect to.                                                                                                                                                                                                                                                                     |
| BACKUP_API_PORT               | no       | 8085          | The Port of the blockchain (not multichain daemon,but they are usally the same) you want to connect to.                                                                                                                                                                                                                                                                           |
| RPC_USER                      | no       | multichainrpc | The user used to connect to the multichain daemon.                                                                                                                                                                                                                                                                                                                                |
| RPC_PASSWORD                  | no       | [hardcoded]   | Password used by the API to connect to the blockchain. The password is set by the origin node upon start. Every slave node needs to use the same RPC password in order to be able to connect to the blockchain. <br>**Hint:** Although the RPC_PASSWORD is not required it is highly recommended to set an own secure one                                                         |
| RPC_PORT                      | no       | 8000          | The port used to expose the multichain daemon of your Trubudget blockchain installation(bc). The port used to connect to the multichain daemon(api). This will be used internally for the communication between the API and the multichain daemon.                                                                                                                                |
| SWAGGER_BASEPATH `deprecated` | no       | /             | This variable was used to choose which environment (prod or test) is used for testing the requests. The variable is deprecated now, as the Swagger documentation can be used for the prod and test environment separately.                                                                                                                                                        |
| JWT_SECRET                    | no       | [random]      | A string that is used to sign JWT which are created by the authenticate endpoint of the api                                                                                                                                                                                                                                                                                       |

## Setup

### Development

Check out our [the ADRs](../doc/adr/) to learn about our current way of doing things.

HTTP.Project <- Multichain.Project <- Project.Project -> Notification.Project

#### Get started

When not yet provisioned, it's recommended to start the server directly with node:

```bash
npm run tsc && node dist/index.js
```

After that, live-reloading doesn't hinder provisioning anymore, plus it's quite convienent, so you might want to use this instead:

```bash
npm run dev
```

#### Run tests

```bash
npm test
```

#### Build a container

```bash
docker build .
```

### API documentation

The documentation is hosted by the API itself. Assuming it's running on your local machine on port 8080, you should see it at [localhost:8080/api/documentation](http://localhost:8080/api/documentation).

If Trubudget is running in test or production an additional environment variable has to be set to ensure that the api documentation is working correctly.

In case of production the variable has to be set to "/prod":

```bash
export SWAGGER_BASEPATH = "/prod"
```

In case of test the variable has to be set to "/test":

```bash
export SWAGGER_BASEPATH = "/test"
```
