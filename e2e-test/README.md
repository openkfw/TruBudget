# End-to-end Tests

This folder contains end-to-end tests which test the whole functionality of the application.

For the setup of the e2e-tests please visit the [Developer Setup](../docs/developer/developer-setup.md#tests)

## Environment Variables

In general, Cypress loads each OS environment variable prefixed with \_CYPRESS\_\_ to be accessible in the code with `Cypress.env`. When defined, they will overrides equivalent variables in the configuration file `cypress.json`. See [Cypress documentation for environment variables setting](https://docs.cypress.io/guides/guides/environment-variables.html#Setting) and [Cypress configuration options](https://docs.cypress.io/guides/references/configuration.html#Options) for more details.

Variables after \_CYPRESS\_\_ prefix can have either camel case or screaming snake case notation. For example, both definitions are equivalent:

```
CYPRESS_baseUrl=http://localhost:3000
```

```
CYPRESS_BASE_URL=http://localhost:3000
```

Those variables can be set in `.env` file also. `.env.example` file is prepared for easy creation (see Developer guide: [Environment variables](../docs/developer/developer-setup.md#environment-variables)). Thanks _cypress-dotenv_ module they can be available in the code. They have the same meaning like its Run Command Arguments conterparts.

| Env Variable Name               | Default Value         | Description                                       |
| ------------------------------- | --------------------- | ------------------------------------------------- |
| CYPRESS_BASE_URL                | http://localhost:3000 | The address of the frontend service.              |
| CYPRESS_API_BASE_URL            | http://localhost:8080 | The address of the api production environment     |
| CYPRESS_EXPORT_SERVICE_BASE_URL | http://localhost:8888 | The address of the excel export service           |
| CYPRESS_ROOT_SECRET             | root-secret           | The Password of the root user, for some api calls |

Note: Do NOT use other additional ways to set environment variables like inline env-variables or env-variables defined by 'export'. Why? - Because these env-variables will overwrite each which makes it very hard to find mistakes.

### Definition Precedense

The evaluation priority of a variable is determined by the on place of its definition:

1. `.env` file (**Recommended** - see Developer guide: [Environment variables](../docs/developer/developer-setup.md#environment-variables))
2. Arguments of the `npm run cypress` or `npm run e2etest` command
3. Operating system environment (defined e.g. with `export` command)
4. Values from the configuration file - `cypress.json` (if exists)

As 1. has the highest priority, 4. the lowest. Order between 3. and 4. is defined by test implementation.

## Run Command Arguments

Following variables are used with connection with command `npm run e2etest` or `npm run cypress`:

| Name                    | Default Value              | Command Line Switch | Description                                   |
| ----------------------- | -------------------------- | ------------------- | --------------------------------------------- |
| baseUrl                 | http://localhost:3000      | env                 | The address of the frontend service.          |
| API_BASE_URL            | http://localhost:8080      | env                 | The address of the api production environment |
| EXPORT_SERVICE_BASE_URL | baseUrl + /api/export/xlsx | env                 | The address of the excel export service       |
| ROOT_SECRET             | not set                    | env                 | Password of the root user, for some api calls |

Note: The only difference between those two commands is `npm run cypress` opens GUI for interaction mode. Obviously, the _spec_ option has no sense in this case.

## Local Run

This section describes how we can run and debug the tests locally with Cypress.

### Prerequisits

Setup a provisioned Trubudget node including the excel-export service. Check out the [Developer Setup](../docs/developer/developer-setup.md) for more details.
The easiest way to start a provisioned Trubudget node is to start it via developer script

```bash
bash scripts/development/start-dev.sh --full
```

Install all required libraries and unset DISPLAY env var (necessary for ubuntu/WSL2)

```bash
apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
unset DISPLAY
```

:::note
If you are using WSL on Windows check out [this setup](https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress) to run cypress in WSL.
:::

Navigate to the `e2e-test` folder and generate the `.env` file. If needed modify the .env file.

```bash
cd e2e-test
cp .env_example .env
```

### Start E2E-Tests via Cypress

After a provisioned trubudget node is setup and cypress is working as expected the e2e-tests can be started.
A report in HTML format will be generated once the tests are finished. This report includes screenshots of the failed tests and information about the passed tests. The report can be found in `cypress/report`.

:::info
Make sure following commands are executed from the `e2e-test` directory.
:::

#### Cypress GUI

Start the `Cypress GUI` to list and be able to execute and follow each test individually.

```bash
npm run cypress
```

#### Command-line

Start and follow all e2e-tests on `command line`.

```bash
npm run e2etest
```

#### Specific tests via command-line

Start a specific test immediately:

```bash
npm run e2etest -- --spec **/currencies_spec.js
```

### Run Cypress GUI in Docker

Showing the GUI of cypress which is running in a docker container is an advanced process that needs additional software (XQuartz) for Windows and Mac. Furthermore, Cypress does not recommend using Cypress in Docker (or Docker Compose) except if you are working without NodeJS (like Python or GO).

For more information see this documentation:
https://www.cypress.io/blog/2019/05/02/run-cypress-with-a-single-docker-command/
