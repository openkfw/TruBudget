# Logging in TruBudget

## Logging Guidelines and information

This section contains guidelines and standards regarding logging and should be expanded as the application matures.
If you want to know more about logging and monitoring in TruBudget, see the [operator guidelines](./../operation-administration/logging-monitoring.md).

### Logger - Pino

The logger used in the application is called "Pino" and you can find the documentation [here](https://github.com/pinojs/pino). Why was Pino used instead of Winston? The reason is that Pino is compatible with Fastify, whereas Winston is not (at least not out of the box).

### Logging - format

Pino supports several log levels (from `trace` to `fatal`). To make sure that the relevant information is in place, each log entry should include an object containing meta data if possible.

#### Error

The call of the "error" level should always contain data of the situation as an "err" object. Example:

```bash
logger.error({ err }, "Stream not found.");
```

where `err` is the object containing information on the root cause of the error.

### Environment variables

There are two settings of the Pino logger that are set via environment variables.

- Set `PRETTY_PRINT` to "true" to enable pretty printing
- Set the log level via `LOG_LEVEL`. This will setting will be used for every service by default.
  The possible values are: "trace", "debug", "info", "warn", "error" and "fatal".

- The developer and operation startup scripts control the log level for each service specifically (see .env_example files in scripts folder). Following Variables can be modified there:
  - Set the log level via `API_LOG_LEVEL`. Controls Log Level for API.
  - Set the log level via `BLOCKCHAIN_LOG_LEVEL`. Controls Log Level for the Blockchain
  - Set the log level via `EXCEL_LOG_LEVEL`. Controls Log Level for Excel Service
  - Set the log level via `EMAIL_LOG_LEVEL`. Controls Log Level for Email Service
  - Set the log level via `PROVISIONING_LOG_LEVEL`. Controls Log Level for Provisioning
  - Set the log level via `STORAGE_LOG_LEVEL`. Controls Log Level for Storage Service


## Frontend Logging

TruBudget offers the possibility to log frontend events such as errors or crashes. To collect and store this data, the TruBudget logging-service must be enabled.
To enable the TruBudget logging-service, the parameter `--with-frontend-logging` must be passed when deploying or when starting TruBudget in development mode with the provided start script.
Make sure all env variables are set correctly as defined [in the environment description](./../environment-variables.md).
