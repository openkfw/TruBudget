import * as Joi from "joi";

import { randomString } from "./service/hash";

export const envVarsSchema = Joi.object({
  LOG_LEVEL: Joi.string()
    .allow("trace", "debug", "info", "warn", "error", "fatal", "", null)
    .empty(["", null])
    .default("info")
    .note("Defines the log output."),
  ORGANIZATION: Joi.string()
    .allow("")
    .empty(["", null])
    .min(1)
    .max(100)
    .default("MyOrga")
    .note(
      "In the blockchain network, each node is represented by its organization name. This environment variable sets this organization name. It is used to create the organization stream on the blockchain and is also displayed in the frontend's top right corner.",
    ),
  PORT: Joi.number()
    .port()
    .default(8091)
    .note(
      "The port used to expose the API for your installation. <br/>Example: If you run TruBudget locally and set API_PORT to `8080`, you can reach the API via `localhost:8080/api`.",
    ),
  ORGANIZATION_VAULT_SECRET: Joi.string()
    .min(5)
    .required()
    .note(
      "This is the key to en-/decrypt user data of an organization. If you want to add a new node for your organization, you want users to be able to log in on either node. <br/>**Caution:** If you want to run TruBudget in production, make sure NOT to use the default value from the `.env.example` file!",
    ),
  ROOT_SECRET: Joi.string()
    .min(8)
    .allow("")
    .empty(["", null])
    .default(randomString(32))
    .note(
      "The root secret is the password for the root user. If you start with an empty blockchain, the root user is needed to add other users, approve new nodes,.. If you don't set a value via the environment variable, the API generates one randomly and prints it to the console <br/>**Caution:** If you want to run TruBudget in production, make sure to set a secure root secret.",
    ),
  MULTICHAIN_RPC_HOST: Joi.string()
    .default("localhost")
    .note(
      "The IP address of the blockchain (not multichain daemon,but they are usally the same) you want to connect to.",
    ),
  MULTICHAIN_RPC_PORT: Joi.number()
    .default(8000)
    .note(
      "The Port of the blockchain where the server is available for incoming http connections (e.g. readiness, versions, backup and restore)",
    ),
  MULTICHAIN_PROTOCOL: Joi.string()
    .default("http")
    .allow("http", "https")
    .note(
      "The protocol used to expose the multichain daemon of your Trubudget blockchain installation(bc). The protocol used to connect to the multichain daemon(api). This will be used internally for the communication between the API and the multichain daemon.",
    ),
  MULTICHAIN_RPC_USER: Joi.string()
    .allow("")
    .empty(["", null])
    .default("multichainrpc")
    .note("The user used to connect to the multichain daemon."),
  MULTICHAIN_RPC_PASSWORD: Joi.string()
    .allow("")
    .empty(["", null])
    .default("s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j")
    .min(32)
    .note(
      "Password used by the API to connect to the blockchain. The password is set by the origin node upon start. Every beta node needs to use the same RPC password in order to be able to connect to the blockchain. <br/>**Hint:** Although the MULTICHAIN_RPC_PASSWORD is not required it is highly recommended to set an own secure one, at least 32 characters long.",
    ),
  BLOCKCHAIN_PORT: Joi.number()
    .default(8085)
    .note(
      "The port used to expose the multichain daemon of your Trubudget blockchain installation(bc). The port used to connect to the multichain daemon(api). This will be used internally for the communication between the API and the multichain daemon.",
    ),
  BLOCKCHAIN_PROTOCOL: Joi.string()
    .default("http")
    .allow("http", "https")
    .note(
      "The Protocol of the blockchain where the server is available for incoming http connections.",
    ),
  SWAGGER_BASEPATH: Joi.string()
    .example("/")
    .forbidden()
    .note(
      "deprecated",
      "This variable was used to choose which environment (prod or test) is used for testing the requests. The variable is deprecated now, as the Swagger documentation can be used for the prod and test environment separately.",
    ),
  JWT_ALGORITHM: Joi.string()
    .allow("HS256", "RS256", "", null)
    .empty(["", null])
    .default("HS256")
    .note("Algorithm used for signing and verifying JWTs."),
  JWT_SECRET: Joi.string()
    .allow("")
    .empty(["", null])
    .default(randomString(10))
    .when("JWT_ALGORITHM", {
      is: "RS256",
      then: Joi.string().min(10).base64().required(),
    })
    .note(
      "A string that is used to sign JWT which are created by the authenticate endpoint of the api. If JWT_ALGORITHM is set to `RS256`, this is required and holds BASE64 encoded PEM encoded private key for RSA.",
    ),
  JWT_PUBLIC_KEY: Joi.string()
    .allow("")
    .empty(["", null])
    .default("")
    .when("JWT_ALGORITHM", {
      is: "RS256",
      then: Joi.string().base64().required(),
    })
    .note(
      "If JWT_ALGORITHM is set to `RS256`, this is required and holds BASE64 encoded PEM encoded public key for RSA.",
    ),
  DOCUMENT_FEATURE_ENABLED: Joi.boolean()
    .empty(["", null])
    .default(false)
    .note(
      "If true, all uploaded documents are stored using trubudget's storage-service. If false, the document feature of TruBudget is disabled, and trying to upload a document will result in an error.",
    ),
  DOCUMENT_EXTERNAL_LINKS_ENABLED: Joi.boolean()
    .default(false)
    .empty(["", null])
    .note(
      'If true, it is possible to use external documents links also without TruBudget\'s storage-service. If false, the external documents links feature of TruBudget is still possible to use in case DOCUMENT_FEATURE_ENABLED equals "true".',
    ),
  STORAGE_SERVICE_HOST: Joi.string().default("localhost").note("IP of connected storage service"),
  STORAGE_SERVICE_PORT: Joi.number()
    .allow("")
    .empty(["", null])
    .default(8090)
    .note("Port of connected storage service"),
  STORAGE_SERVICE_PROTOCOL: Joi.string()
    .default("http")
    .allow("http", "https")
    .note("Protocol of connected storage service."),
  STORAGE_SERVICE_EXTERNAL_URL: Joi.string()
    .allow("")
    .empty(null)
    .default("")
    .when("DOCUMENT_FEATURE_ENABLED", {
      is: true,
      then: Joi.required(),
    })
    .note("IP and port of own connected storage service accessible externally"),
  EMAIL_HOST: Joi.string().allow("").empty(["", null]).default("localhost"),
  EMAIL_PORT: Joi.number().allow("").empty(["", null]).default(8089),
  EMAIL_PROTOCOL: Joi.string()
    .default("http")
    .allow("http", "https")
    .note("Protocol of connected storage service."),
  ACCESS_CONTROL_ALLOW_ORIGIN: Joi.string()
    .allow("")
    .empty(["", null])
    .default("*")
    .note(
      "Since the service uses CORS, the domain by which it can be called needs to be set. Setting this value to `*` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).",
    ),
  NODE_ENV: Joi.string()
    .default("production")
    .allow("production", "development", "testing", "", null)
    .empty(["", null])
    .note(
      "If set to `development` api will allow any string as password. If set to `production` passwords must satisfy safePasswordSchema, see lib/joiValidation-.ts & -.spec.ts files",
    ),
  ENCRYPTION_PASSWORD: Joi.string()
    .allow("")
    .note(
      "If set, all data that is send to the MultiChain node and external storage will be symmetrically encrypted by the ENCRYPTION_PASSWORD",
    ),
  SIGNING_METHOD: Joi.string()
    .default("node")
    .allow("node", "user", "", null)
    .empty(["", null])
    .note(
      "Possible signing methods are: `node` and `user`. Transactions on the chain will be signed using either the address of the node or the address of the specific user publishing that transaction.",
    ),
  RATE_LIMIT: Joi.number()
    .allow("", null)
    .empty(["", null])
    .optional()
    .note(
      "If set, API will limit the number of requests from any individual IP address to the set number per minute. Can be set to any `number`, but shouldn't be set too low.",
    ),
  AUTHPROXY_ENABLED: Joi.boolean()
    .default(false)
    .empty(["", null])
    .note("Enables logging in using the authorization token from authentication proxy"),
  AUTHPROXY_JWS_SIGNATURE: Joi.string()
    .allow("")
    .empty(["", null])
    .when("AUTHPROXY_ENABLED", {
      is: true,
      then: Joi.required(),
    })
    .note("secret/public key/certificate for verifying auth proxy token signature"),
  DB_TYPE: Joi.string().default("pg"),
  SQL_DEBUG: Joi.boolean().empty(["", null]).default(false),
  API_DB_USER: Joi.string()
    .empty(["", null])
    .default("postgres")
    .allow("")
    .when("REFRESH_TOKEN_STORAGE", {
      is: "db",
      then: Joi.required(),
    })
    .note("Database user for database connection, e.g. postgres"),
  API_DB_PASSWORD: Joi.string()
    .allow("")
    .empty(["", null])
    .when("REFRESH_TOKEN_STORAGE", {
      is: "db",
      then: Joi.required(),
    })
    .default("test")
    .note("Database password for database connection"),
  API_DB_HOST: Joi.string()
    .when("REFRESH_TOKEN_STORAGE", {
      is: "db",
      then: Joi.required(),
    })
    .allow("")
    .empty(["", null])
    .default("localhost")
    .note("Database host"),
  API_DB_NAME: Joi.string()
    .allow("")
    .empty(["", null])
    .when("REFRESH_TOKEN_STORAGE", {
      is: "db",
      then: Joi.required(),
    })
    .default("trubudget_email_service")
    .example("trubudget-db")
    .note("Name of the used database"),
  API_DB_PORT: Joi.number()
    .when("REFRESH_TOKEN_STORAGE", {
      is: "db",
      then: Joi.required(),
    })
    .empty(["", null])
    .allow("")
    .default(5432)
    .note("Database port, e.g. 5432"),
  API_DB_SSL: Joi.boolean()
    .when("REFRESH_TOKEN_STORAGE", {
      is: "db",
      then: Joi.required(),
    })
    .allow("")
    .empty(["", null])
    .default(false)
    .note('Database SSL connection. Allowed values: "true" or "false".'),
  API_DB_SCHEMA: Joi.string()
    .when("REFRESH_TOKEN_STORAGE", {
      is: "db",
      then: Joi.required(),
    })
    .empty(["", null])
    .default("public")
    .note('Database schema, e.g. "public".'),
  REFRESH_TOKEN_EXPIRATION: Joi.number()
    .default(8)
    .allow("")
    .empty(["", null])
    .note("Refresh token expiration in hours"),
  ACCESS_TOKEN_EXPIRATION: Joi.number()
    .default(15)
    .allow("")
    .empty(["", null])
    .note("Access token expiration in minutes"),
  API_REFRESH_TOKENS_TABLE: Joi.string()
    .empty(["", null])
    .default("refresh_token")
    .when("REFRESH_TOKEN_STORAGE", {
      is: "db",
      then: Joi.required(),
    })
    .note('Name of table where refresh tokens will be stored, e.g. "refresh_token".'),
  REFRESH_TOKEN_STORAGE: Joi.string()
    .allow("db", "memory", "")
    .note(
      'Determining the type of storage for refresh tokens. Allowed values are "db" or "memory" or blank to disable refresh token functionality.',
    ),
  SNAPSHOT_EVENT_INTERVAL: Joi.number().default(3),
  SILENCE_LOGGING_ON_FREQUENT_ROUTES: Joi.boolean()
    .default(false)
    .empty(["", null])
    .note(
      'Set to "true" if you want to hide route logging on frequent and technical endpoints like `/readiness`, `/version`, etc.',
    ),
  APPLICATIONINSIGHTS_CONNECTION_STRING: Joi.string()
    .allow("")
    .note("Azure Application Insights Connection String"),
})
  .unknown()
  .required();
