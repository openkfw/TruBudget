# Trubudget Email Service

## Environment Variables

To ensure all necessary environment variables are set correctly this section describes all environment variables across
all services.

### Email-notification

| Env Variable                | Default Value                     | Description                                                                                                                                                                                                                                            |
| --------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PORT                        | 8890                              | The port used to expose the email-notification service                                                                                                                                                                                                 |
| DB_TYPE                     | pg                                | Type of database. A supported list can be found in the [Database Configuration section](#database-configuration)                                                                                                                                       |
| DB_NAME                     | trubudget_email_service           | Name of the database                                                                                                                                                                                                                                   |
| DB_USER                     | postgres                          | User name for connected database                                                                                                                                                                                                                       |
| DB_PASSWORD                 | test                              | Password for connected database                                                                                                                                                                                                                        |
| DB_HOST                     | localhost                         | IP of connected database                                                                                                                                                                                                                               |
| DB_PORT                     | 5432                              | Port of connected database                                                                                                                                                                                                                             |
| DB_SCHEMA                   | public                            | Schema of connected database                                                                                                                                                                                                                           |
| DB_SSL                      | false                             | If true the DB connection is using the SSL protocol                                                                                                                                                                                                    |
| USER_TABLE                  | users                             | Name of the table which is created if the first email address is inserted                                                                                                                                                                              |
| SMTP_USER                   | testuser                          | This is forwarded to the auth prop of the nodemailer's transport-options, to authenticate with the credentials of the configured SMTP server                                                                                                           |
| SMTP_PASSWORD               | test                              | IP of external SMTP-Server used to actually send notification emails                                                                                                                                                                                   |
| SMTP_HOST                   | localhost                         | IP of external SMTP-Server used to actually send notification emails                                                                                                                                                                                   |
| SMTP_PORT                   | 2500                              | Port of external SMTP-Server                                                                                                                                                                                                                           |
| SMTP_SSL                    | false                             | If true the external SMTP-Server connection is using the SSL protocol                                                                                                                                                                                  |
| SQL_DEBUG                   | false                             | The SQL Debug option is forwarded to the knex configuration                                                                                                                                                                                            |
| EMAIL_FROM                  | Trubudget Notification Service    | This is injected into the `from` field of the email notification                                                                                                                                                                                       |
| EMAIL_SUBJECT               | Trubudget Notification            | This is injected into the `subject` field of the email notification                                                                                                                                                                                    |
| EMAIL_TEXT                  | You have received a notification. | This is injected into the `body` of the email notification                                                                                                                                                                                             |
| LOG_LEVEL                   | info                              | Defines the log output. Supported levels are `trace`, `debug`, `info`, `warn`, `error`, `fatal`                                                                                                                                                        |
| PRETTY_PRINT                | false                             | Decides whether the logs printed by the email service are pretty printed or not.                                                                                                                                                                       |
| JWT_ALGORITHM               | HS256                             | Algorithm used for signing and verifying JWTs. Currently `HS256` or `RS256` are supported.                                                                                                                                                             |
| JWT_SECRET                  | random                            | If JWT_ALGORITHM is set to `HS256`, this is required and holds a secret to verify API-issued JWTs. If JWT_ALGORITHM is `RS256`, leave blank.                                                                                                           |
| JWT_PUBLIC_KEY              | -                                 | If JWT_ALGORITHM is set to `RS256`, this is required and holds BASE64 encoded PEM encoded public key for RSA.                                                                                                                                          |
| AUTHENTICATION              | JWT                               | If set to none, no JWT-Token is required for all endpoints. If set JWT, a JWT token is necessary                                                                                                                                                       |
| ACCESS_CONTROL_ALLOW_ORIGIN | "\*"                              | Since the service uses CORS, the domain by which it can be called needs to be set. Setting this value to `"*"` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). |

### Blockchain

The blockchain can be configured to use the email-notification feature via the following environment variables:

| Env Variable               | Required | Default Value    | Description                                                                                                                                                      |
| -------------------------- | -------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EMAIL_SERVICE_ENABLED      | no       | false            | If set to `true` the Email-Service feature is enabled and the EMAIL\_\* variables are required                                                                   |
| EMAIL_HOST                 | no       |                  | The IP address from the email-notification service.                                                                                                              |
| EMAIL_PORT                 | no       |                  | The port address from the email-notification service.                                                                                                            |
| EMAIL_SSL                  | no       | false            | If set to `true` the connection between blockchain and email-notification service is https instead of http                                                       |
| NOTIFICATION_PATH          | no       | ./notifications/ | The path where notification files shall be saved on the blockchain environment                                                                                   |
| NOTIFICATION_MAX_LIFETIME  | no       | 24               | This number configure how long notifications shall be saved in the NOTIFICATION_PATH in hours                                                                    |
| NOTIFICATION_SEND_INTERVAL | no       | 10               | This number configure in which interval the notifications in the NOTIFICATION_PATH should be checked and send                                                    |
| JWT_SECRET                 | no       |                  | The `JWT_SECRET` is only required if the Email feature is enabled. It is used to authenticate the blockchain at the email-service, so it can send notifications. |

### Frontend

The frontend can be configured to use the email-notification feature via the following environment variables:

| Env Variable                    | Default Value | Description                                                                                                                                                     |
| ------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REACT_APP_EMAIL_SERVICE_ENABLED | false         | When enabled, the frontend requests a email-service readiness call when entering the login screen.<br/>If true the email section in the user-profile is enabled |
| EMAIL_HOST                      | -             | IP address of the email notification service                                                                                                                    |
| EMAIL_PORT                      | 8890          | Port of the email notification service                                                                                                                          |

#### JWT_SECRET

The JWT_SECRET is shared between Trubudget's blockchain api and email-service. The endpoints of the email-service can
only be used by providing a valid JWT_TOKEN signed with this JWT_SECRET. Since the blockchain is using the notification
endpoints and the ui is using the user endpoints the secret has to be shared.
