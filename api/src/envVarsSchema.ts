import * as Joi from "joi";
import { randomString } from "./service/hash";

export const envVarsSchema = Joi.object({
  ORGANIZATION: Joi.string()
    .min(1)
    .max(100)
    .required()
    .note(
      "In the blockchain network, each node is represented by its organization name. This environment variable sets this organization name. It is used to create the organization stream on the blockchain and is also displayed in the frontend's top right corner.",
    ),
  PORT: Joi.number()
    .min(0)
    .max(65535)
    .default(8091)
    .note(
      "The port used to expose the API for your installation. <br/>Example: If you run TruBudget locally and set API_PORT to `8080`, you can reach the API via `localhost:8080/api`.",
    ),
  ORGANIZATION_VAULT_SECRET: Joi.string()
    .invalid("secret")
    .required()
    .note(
      "This is the key to en-/decrypt user data of an organization. If you want to add a new node for your organization, you want users to be able to log in on either node. <br/>**Caution:** If you want to run TruBudget in production, make sure NOT to use the default value from the `.env_example` file!",
    ),
  ROOT_SECRET: Joi.string()
    .min(8)
    .required()
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
  MULTICHAIN_RPC_USER: Joi.string()
    .default("multichainrpc")
    .note("The user used to connect to the multichain daemon."),
  MULTICHAIN_RPC_PASSWORD: Joi.string()
    .default("s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j")
    .note(
      "Password used by the API to connect to the blockchain. The password is set by the origin node upon start. Every beta node needs to use the same RPC password in order to be able to connect to the blockchain. <br/>**Hint:** Although the MULTICHAIN_RPC_PASSWORD is not required it is highly recommended to set an own secure one.",
    ),
  BLOCKCHAIN_PORT: Joi.number()
    .default(8085)
    .note(
      "The port used to expose the multichain daemon of your Trubudget blockchain installation(bc). The port used to connect to the multichain daemon(api). This will be used internally for the communication between the API and the multichain daemon.",
    ),
  SWAGGER_BASEPATH: Joi.string()
    .example("/")
    .forbidden()
    .note(
      "deprecated",
      "This variable was used to choose which environment (prod or test) is used for testing the requests. The variable is deprecated now, as the Swagger documentation can be used for the prod and test environment separately.",
    ),
  JWT_ALGORITHM: Joi.string()
    .default("HS256")
    .valid("HS256", "RS256")
    .note("Algorithm used for signing and verifying JWTs."),
  JWT_SECRET: Joi.string()
    .min(32)
    .default(randomString(32))
    .when("JWT_ALGORITHM", {
      is: "RS256",
      then: Joi.string().base64().required(),
    })
    .note(
      "A string that is used to sign JWT which are created by the authenticate endpoint of the api. If JWT_ALGORITHM is set to `RS256`, this is required and holds BASE64 encoded PEM encoded private key for RSA.",
    ),
  JWT_PUBLIC_KEY: Joi.string()
    .default("")
    .when("JWT_ALGORITHM", {
      is: "RS256",
      then: Joi.string().base64().required(),
    })
    .note(
      "If JWT_ALGORITHM is set to `RS256`, this is required and holds BASE64 encoded PEM encoded public key for RSA.",
    ),
  DOCUMENT_FEATURE_ENABLED: Joi.boolean().default(false),
  DOCUMENT_EXTERNAL_LINKS_ENABLED: Joi.boolean().default(false),
  STORAGE_SERVICE_HOST: Joi.string().default("localhost"),
  STORAGE_SERVICE_PORT: Joi.number().default(8090),
  STORAGE_SERVICE_EXTERNAL_URL: Joi.string().default("").when("DOCUMENT_FEATURE_ENABLED", {
    is: true,
    then: Joi.required(),
  }),
  EMAIL_HOST: Joi.string().default("localhost"),
  EMAIL_PORT: Joi.number().default(8089),
  ACCESS_CONTROL_ALLOW_ORIGIN: Joi.string().default("*"),
  NODE_ENV: Joi.string().default("production"),
  ENCRYPTION_PASSWORD: Joi.string(),
  SIGNING_METHOD: Joi.string().default("node"),
  RATE_LIMIT: Joi.number().allow("").empty(""),
  AUTHPROXY_ENABLED: Joi.boolean().default(false),
  AUTHPROXY_JWS_SIGNATURE: Joi.string(),
  DB_TYPE: Joi.string().default("pg"),
  SQL_DEBUG: Joi.boolean().default(false),
  API_DB_USER: Joi.string().default("postgres"),
  API_DB_PASSWORD: Joi.string().default("test"),
  API_DB_HOST: Joi.string().default("localhost"),
  API_DB_NAME: Joi.string().default("trubudget_email_service"),
  API_DB_PORT: Joi.number().default(5432),
  API_DB_SSL: Joi.boolean().default(false),
  API_DB_SCHEMA: Joi.string().default("public"),
  API_REFRESH_TOKENS_TABLE: Joi.string().default("refresh_token"),
  REFRESH_TOKEN_STORAGE: Joi.string().allow("db", "memory"),
  SNAPSHOT_EVENT_INTERVAL: Joi.number().default(3),
  SILENCE_LOGGING_ON_FREQUENT_ROUTES: Joi.boolean().default(false),
  APPLICATIONINSIGHTS_CONNECTION_STRING: Joi.string().allow(""),
})
  .unknown()
  .required();
