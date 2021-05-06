# End-to-end Tests

This folder contains end-to-end tests which test the whole functionality of the application.

For the setup of the e2e-tests please visit the [Developer-Setup](https://github.com/openkfw/TruBudget/blob/master/doc/installation/Developer-Setup.md#tests)

## Environment Variables

In general, Cypress loads each OS environment variable prefixed with \_CYPRESS\_\_ to be accessible in the code with `Cypress.env`. When defined, they will overrides equivalent variables in the configuration file `cypress.json`. See [Cypress documentation for enviroment variables setting](https://docs.cypress.io/guides/guides/environment-variables.html#Setting) and [Cypress configuration options](https://docs.cypress.io/guides/references/configuration.html#Options) for more details.

Variables after \_CYPRESS\_\_ prefix can have either camel case or screaming snake case notation. For example, both definitions are equivalent:

```
CYPRESS_baseUrl=http://localhost:3000
```

```
CYPRESS_BASE_URL=http://localhost:3000
```

Those variables can be set in `.env` file also. `.env_example` file is prepared for easy creation (see Developer guide: [Environment variables](../doc/installation/Developer-Setup.md#environment-variables)). Thanks _cypress-dotenv_ module they can be available in the code. They have the same meaning like its Run Command Arguments conterparts.

| Env Variable Name               | Default Value         | Description                                       |
| ------------------------------- | --------------------- | ------------------------------------------------- |
| CYPRESS_BASE_URL                | http://localhost:3000 | The address of the frontend service.              |
| CYPRESS_API_BASE_URL            | http://localhost:8080 | The address of the api production environment     |
| CYPRESS_EXPORT_SERVICE_BASE_URL | http://localhost:8888 | The address of the excel export service           |
| CYPRESS_ROOT_SECRET             | root-secret           | The Password of the root user, for some api calls |

Note: Do NOT use other additional ways to set environment variables like inline env-variables or env-variables defined by 'export'. Why? - Because these env-variables will overwrite each which makes it very hard to find mistakes.

### Definition Precedense

The evaluation priority of a variable is determined by the on place of its definition:

1. `.env` file (**Recommended** - see Developer guide: [Environment variables](../doc/installation/Developer-Setup.md#environment-variables))
2. Arguments of the `npm run cypress` or `npm run e2etest` command
3. Operating system environment (defined e.g. with `export` command)
4. Values from the configuration file - `cypress.json` (if exists)

As 1. has the highest priority, 4. the lowest. Order between 3. and 4. is defined by test implementation.

## Run Command Arguments

Following variables are used with connection with command `npm run e2etest` or `npm run cypress`:

| Name                    | Default Value                   | Command Line Switch | Description                                   |
| ----------------------- | ------------------------------- | ------------------- | --------------------------------------------- |
| baseUrl                 | http://localhost:3000           | env                 | The address of the frontend service.          |
| API_BASE_URL            | http://localhost:8080           | env                 | The address of the api production environment |
| EXPORT_SERVICE_BASE_URL | baseUrl + /test/api/export/xlsx | env                 | The address of the excel export service       |
| ROOT_SECRET             | not set                         | env                 | Password of the root user, for some api calls |

Note: The only difference between those two commands is `npm run cypress` opens GUI for interaction mode. Obviously, the _spec_ option has no sense in this case.

## Local Run

This section describes how we can run and debug the tests locally with Cypress.

### Run Cypress with Dockerized Application in one Command

Pull, build and run entire application with Cypress end-to-end tests:

```bash
sh scripts/testing/start-all-e2e-tests.sh
```

Run built application with minimal required container along with all Cypress tests. Cypress tests are defined in own service. Tests can be rerun.

Note: .env* file is not needed because every environment variables are set in Docker Compose. Moreover, its content will override environment variables set for the \_e2etest* service.

Restart Docker container with E2E tests (after exiting):

```bash
docker start trubudget_e2etest_1
```

### Run Cypress GUI with Dockerized Application

To start the cypress GUI to select specific tests, simply start a TruBudget setup and after that, start cypress.

You can run application in many ways: pull built images, each service in separated terminal or in development mode. See [Developer Setup](https://github.com/openkfw/TruBudget/blob/master/doc/installation/Developer-Setup.md) for more details.

One example is to start this docker-compose setup

```bash
sh scripts/multi/start-dev-multi-node.sh
```

and after the docker-compose setup has builded and started successfully, start cypress:

Navigate to the /e2e-test folder

```bash
cd e2e-test
```

and start the Cypress GUI (recommended):

```bash
npm run cypress
```

OR start all e2e-tests immediately:

```bash
npm run e2etest
```

OR start a specific test immediately:

```bash
npm run e2etest -- --spec **/currencies_spec.js
```

Note: .env\* file is needed. If you have not .env\* file, create one and copy the content from .env_example\* to .env\*.

### Run Cypress GUI in Docker

Showing the GUI of cypress which is running in a docker container is an advanced process that needs additional software (XQuartz) for Windows and Mac. Furthermore, Cypress does not recommend using Cypress in Docker (or Docker-Compose) except if you are working without NodeJS (like Python or GO).

For more information see this documentation:
https://www.cypress.io/blog/2019/05/02/run-cypress-with-a-single-docker-command/
