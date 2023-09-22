# Trubudget Frontend

## Environment Variables

### Frontend

| Env Variable                | Default Value                                                                       | Description                                                                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NODE_ENV                    | -                                                                                   | If set to `development` search Trubudget's external services (Email-/Excel-Export-Service) on localhost. <br>If set to `production` disable Redux devtools extension |
| REACT_APP_VERSION           | -                                                                                   | Injected version via `$npm_package_version` in`.env` file to ensure the version is shown in the frontend                                                             |
| API_HOST                    | -                                                                                   | IP address of the api. This is only required if nginx proxy is used. <br>**Hint:** When deployed locally the host is set to localhost                                |
| API_PORT                    | 8080                                                                                | Port of the api. This is only required if nginx proxy is used                                                                                                        |
| REACT_APP_EXCHANGE_RATE_URL | `https://data-api.ecb.europa.eu/service/data/EXR/D..EUR.SP00.A?lastNObservations=1` | The external URL where the exchange rates are fetched from                                                                                                           |
| REACT_APP_AUTHBUDDY_ENABLED | `false`                                                                             | Enables rendering of AuthBuddy login button                                                                                                                          |
| REACT_APP_AUTHBUDDY_URL     | `http://localhost:4000/signin`                                                      | AuthBuddy ingress. Required if REACT_APP_AUTHBUDDY_ENABLED is set to true                                                                                            |

### Email-Service

Following environment variables need to be set to enable and configure the email-notification feature:

| Env Variable                    | Default Value | Description                                                                                                                                                     |
| ------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REACT_APP_EMAIL_SERVICE_ENABLED | false         | When enabled, the frontend requests a email-service readiness call when entering the login screen.<br/>If true the email section in the user-profile is enabled |
| EMAIL_HOST                      | -             | IP address of the email notification service                                                                                                                    |
| EMAIL_PORT                      | 8890          | Port of the email notification service                                                                                                                          |

### Excel-Export-Service

Following environment variables need to be set to enable and configure the excel-export feature:

| Env Variable                     | Default Value | Description                                                                                                                                         |
| -------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| REACT_APP_EXPORT_SERVICE_ENABLED | false         | If true the frontend requests a export-service readiness call when entering the login screen and <br/>the export button is shown at the side navbar |
| EXPORT_HOST                      | -             | IP address of the excel export service                                                                                                              |
| EXPORT_PORT                      | 8888          | Port of the excel export service                                                                                                                    |
