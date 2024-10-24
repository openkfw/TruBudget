import * as Joi from "joi";

const extendedEmailRegex = /^"?[\w\s]+"?\s*<\s*[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}\s*>$/;

export const envVarsSchema = Joi.object({
  AUTHENTICATION: Joi.string()
    .allow("none", "jwt")
    .default("jwt")
    .note(
      "If set to none, no JWT-Token is required for all endpoints. If set JWT, a JWT token is necessary.",
    ),
  PORT: Joi.number()
    .port()
    .default(8890)
    .note("The port used to expose the email-notification service."),
  DB_TYPE: Joi.string()
    .allow("pg", "sqlite3", "mysql", "mysql2", "oracledb", "mssql")
    .default("pg")
    .note(
      "Type of database. A currently supported list can be found in the [Database Configuration section](#database-configuration).",
    ),
  DB_USER: Joi.string().default("postgres").note("User name for connected database."),
  DB_PASSWORD: Joi.string().default("test").note("Password for connected database."),
  DB_HOST: Joi.string().default("localhost").note("IP/host of connected database."),
  DB_NAME: Joi.string().default("trubudget_email_service").note("Name of the database."),
  DB_PORT: Joi.number().port().default(5432).note("Port of connected database."),
  DB_SSL: Joi.boolean().default(false).note("If true the DB connection is using the SSL protocol"),
  DB_SCHEMA: Joi.string().default("public").note("Schema of connected database"),
  SQL_DEBUG: Joi.boolean()
    .default(false)
    .empty("")
    .note("The SQL Debug option is forwarded to the knex configuration."),
  USER_TABLE: Joi.string()
    .default("users")
    .note("Name of the table which is created if the first email address is inserted."),
  SMTP_HOST: Joi.string()
    .default("localhost")
    .note("IP/host of external SMTP-Server used to actually send notification emails."),
  SMTP_PORT: Joi.number().port().default(2500).note("Port of external SMTP-Server."),
  SMTP_SSL: Joi.boolean()
    .default(false)
    .empty("")
    .note("If true the external SMTP-Server connection is using the SSL protocol."),
  SMTP_USER: Joi.string()
    .default("")
    .note(
      "This is forwarded to the auth prop of the nodemailer's transport-options, to authenticate with the credentials of the configured SMTP server.",
    ),
  SMTP_PASSWORD: Joi.string()
    .default("")
    .note("Password of external SMTP-Server used to actually send notification emails."),
  EMAIL_FROM: Joi.string()
    .custom((value, helpers) => {
      const emailSchema = Joi.string().email();
      const emailValidation = emailSchema.validate(value);

      if (emailValidation.error && !extendedEmailRegex.test(value)) {
        return helpers.message({
          custom:
            '"{{#label}}" must be a valid email or extended email format, e.g. "Name" <email@example.com>. But ' +
            value +
            " was provided.",
        });
      }

      return value; // valid
    }, "Email or Extended Email Validation")
    .required()
    .note("This is injected into the `from` field of the email notification."),
  EMAIL_SUBJECT: Joi.string()
    .default("Trubudget Notification")
    .note("This is injected into the `subject` field of the email notification."),
  EMAIL_TEXT: Joi.string()
    .default("You have received a notification.")
    .note("This is injected into the `body` of the email notification."),
  ACCESS_CONTROL_ALLOW_ORIGIN: Joi.string()
    .default("*")
    .note(
      "Since the service uses CORS, the domain by which it can be called needs to be set. Setting this value to `" +
        "*` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).",
    ),
  RATE_LIMIT: Joi.number().allow("").empty(""),
  JWT_SECRET: Joi.string()
    .when("JWT_ALGORITM", {
      is: "HS256",
      then: Joi.string().min(32).required(),
      otherwise: Joi.string().default(""),
    })
    .note(
      "If JWT_ALGORITHM is set to `HS256`, this is required and holds a secret to verify API-issued JWTs, with 32 length. If JWT_ALGORITHM is `RS256`, leave blank.",
    ),
  JWT_PUBLIC_KEY: Joi.string()
    .when("JWT_ALGORITHM", {
      is: "RS256",
      then: Joi.string().required(),
      otherwise: Joi.string().default(""),
    })
    .note(
      "If JWT_ALGORITHM is set to `RS256`, this is required and holds BASE64 encoded PEM encoded public key for RSA.",
    ),
  JWT_ALGORITHM: Joi.string()
    .allow("HS256", "RS256")
    .empty("")
    .default("HS256")
    .note(
      "Algorithm used for signing and verifying JWTs. Currently `HS256` or `RS256` are supported.",
    ),
  LOG_LEVEL: Joi.string()
    .allow("trace", "debug", "info", "warn", "error", "fatal")
    .default("info")
    .note("Defines the log output."),
  PRETTY_PRINT: Joi.boolean()
    .default(false)
    .empty("")
    .note("If true the log output is pretty printed."),
})
  .unknown()
  .required();
