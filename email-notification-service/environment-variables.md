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
| JWT_SECRET                  | - (required)                      | A secret of min length of 32 - It is used to verify the JWT_TOKEN sent by users of the email-service endpoints                                                                                                                                         |
| AUTHENTICATION              | JWT                               | If set to none, no JWT-Token is required for all endpoints. If set JWT, a JWT token is necessary                                                                                                                                                       |
| ACCESS_CONTROL_ALLOW_ORIGIN | "\*"                              | Since the service uses CORS, the domain by which it can be called needs to be set. Setting this value to `"*"` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). |

### Blockchain

For details see [Blockchain environment variables](../blockchain/environment-variables.md#email-service).

### Frontend

For details see [Blockchain environment variables](../frontend/environment-variables.md#email-service).

#### JWT_SECRET

The JWT_SECRET is shared between Trubudget's blockchain api and email-service. The endpoints of the email-service can
only be used by providing a valid JWT_TOKEN signed with this JWT_SECRET. Since the blockchain is using the notification
endpoints and the ui is using the user endpoints the secret has to be shared.
