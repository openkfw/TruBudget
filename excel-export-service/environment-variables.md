# Trubudget Excel Service

## Environment Variables

### Excel-Export

| Env Variable                | Default Value | Description                                                                                                                                                                                                                                                   |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PORT                        | 8888          | The port used to expose the excel-export service.                                                                                                                                                                                                             |
| API_HOST                    | localhost     | IP address of the api                                                                                                                                                                                                                                         |
| API_PORT                    | 8080          | Port of the api                                                                                                                                                                                                                                               |
| API_PROTOCOL                | http          | Protocol of the api. "http" or "https"                                                                                                                                                                                                                        |
| ACCESS_CONTROL_ALLOW_ORIGIN | "\*"          | Since the export service uses CORS, the domain by which it can be called needs to be set. Setting this value to `"*"` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). |
| LOG_LEVEL                   | info          | Defines the log output. Supported levels are `trace`, `debug`, `info`, `warn`, `error`, `fatal`                                                                                                                                                               |
| RATE_LIMIT                  | 100           | Defines the limit each IP to {RATE_LIMIT} requests per windowMs (1 minute)                                                                                                                                                                                    |
| CI_COMMIT_SHA               | ""            | Defines the CI_COMMIT_SHA property returned by the version endpoint.                                                                                                                                                                                          |
| BUILDTIMESTAMP              | ""            | Defines the BUILDTIMESTAMP property returned by the version endpoint.                                                                                                                                                                                         |

### Frontend

| Env Variable                     | Default Value | Description                                                                                                                                         |
| -------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| REACT_APP_EXPORT_SERVICE_ENABLED | false         | If true the frontend requests a export-service readiness call when entering the login screen and <br/>the export button is shown at the side navbar |
| EXPORT_HOST                      | -             | IP address of the excel export service                                                                                                              |
| EXPORT_PORT                      | 8888          | Port of the excel export service                                                                                                                    |
| EXPORT_PROTOCOL                  | http          | Protocol of the excel export service. "http" or "https"                                                                                             |
