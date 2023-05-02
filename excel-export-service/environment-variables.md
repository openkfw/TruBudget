# Trubudget Excel Service

## Environment Variables

### Excel-Export

| Env Variable                | Default Value | Description                                                                                                                                                                                                                                                   |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PORT                        | 8888          | The port used to expose the excel-export service.                                                                                                                                                                                                             |
| API_HOST                    | localhost     | IP address of the api                                                                                                                                                                                                                                         |
| API_PORT                    | 8080          | Port of the api                                                                                                                                                                                                                                               |
| ACCESS_CONTROL_ALLOW_ORIGIN | "\*"          | Since the export service uses CORS, the domain by which it can be called needs to be set. Setting this value to `"*"` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). |
| LOG_LEVEL                   | info          | Defines the log output. Supported levels are `trace`, `debug`, `info`, `warn`, `error`, `fatal`                                                                                                                                                               |
| CI_COMMIT_SHA               | ""            | Defines the CI_COMMIT_SHA property returned by the version endpoint.                                                                                                                                                                                          |
| BUILDTIMESTAMP              | ""            | Defines the BUILDTIMESTAMP property returned by the version endpoint.                                                                                                                                                                                         |

### Frontend

For details see [Frontend environment variables](../frontend/environment-variables.md#excel-export-service).
