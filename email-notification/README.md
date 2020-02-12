# Email-Notification-Service

## Database Configuration

This project is using knex to connect to the database where user email addresses are stored. Knex makes it possible to use a database you like unless it is supported.
Supported databases are:

| Database                   | Driver  |
| -------------------------- | ------- |
| PostgreSQL/Amazon Redshift | pg      |
| MySQL/MariaDB              | mysql   |
| SQLite3                    | sqlite3 |
| MSSQL                      | mssql   |

To install the driver for your database type in following command:

```
npm install <Driver> --save
```

## Environment Variables

| Env Variable | Default Value           | Description                                                                                                      |
| ------------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| HTTP_PORT    | 8890                    | Port for HTTP Server responsible for insert/delete emails in connected database                                  |
| TCP_PORT     | 8889                    | Port for TCP Server responsible for generating/sending emails to the external SMTP-Server                        |
| DB_TYPE      | pg                      | Type of database. A supported list can be found in the [Database Configuration section](#database-configuration) |
| DB_NAME      | trubudget_email_service | Name of the database                                                                                             |
| DB_USER      | postgres                | User name for connected database                                                                                 |
| DB_PASSWORD  | test                    | Password for connected database                                                                                  |
| DB_HOST      | localhost               | IP of connected database                                                                                         |
| DB_PORT      | 5432                    | Port of connected database                                                                                       |
| DB_SCHEMA    | public                  | Schema of connected database                                                                                     |
| USER_TABLE   | users                   | Name of the table which is created if the first email address is inserted                                        |
| SMTP_HOST    | localhost               | IP of external SMTP-Server used to actually send notification emails                                             |
| SMTP_PORT    | 2500                    | Port of external SMTP-Server                                                                                     |
