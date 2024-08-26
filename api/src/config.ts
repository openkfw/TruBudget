import Joi from "joi";
import logger from "./lib/logger";
import { randomString } from "./service/hash";

export interface JwtConfig {
  secretOrPrivateKey: string;
  publicKey: string;
  algorithm: "HS256" | "RS256";
}

/**
 * Shows all environment variables that the api can contain
 * @notExported
 */
interface ProcessEnvVars {
  ORGANIZATION: string;
  ORGANIZATION_VAULT_SECRET: string;
  PORT: string;
  ROOT_SECRET: string;
  MULTICHAIN_RPC_HOST: string;
  MULTICHAIN_RPC_PORT: string;
  MULTICHAIN_RPC_USER: string;
  MULTICHAIN_RPC_PASSWORD: string;
  BLOCKCHAIN_PORT: string;
  JWT_ALGORITHM: string;
  JWT_SECRET: string;
  JWT_PUBLIC_KEY: string;
  CI_COMMIT_SHA: string;
  BUILDTIMESTAMP: string;
  DOCUMENT_FEATURE_ENABLED: string;
  DOCUMENT_EXTERNAL_LINKS_ENABLED: string;
  STORAGE_SERVICE_HOST: string;
  STORAGE_SERVICE_PORT: string;
  STORAGE_SERVICE_EXTERNAL_URL: string;
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  ACCESS_CONTROL_ALLOW_ORIGIN: string;
  NODE_ENV: string;
  ENCRYPTION_PASSWORD: string;
  SIGNING_METHOD: string;
  npm_package_version: string;
  RATE_LIMIT: string;
  AUTHPROXY_ENABLED: string;
  AUTHPROXY_JWS_SIGNATURE: string;
  SNAPSHOT_EVENT_INTERVAL: string;
  SILENCE_LOGGING_ON_FREQUENT_ROUTES: string;
  API_DB_USER: string;
  API_DB_PASSWORD: string;
  API_DB_HOST: string;
  API_DB_DATABASE: string;
  API_DB_PORT: string;
  API_DB_SSL: string;
  API_DB_SCHEMA: string;
  API_REFRESH_TOKENS_TABLE: string;
  REFRESH_TOKEN_STORAGE?: string; // "db" || "memory" || undefined
}

interface DatabaseConfig {
  user: string;
  password: string;
  host: string;
  database: string;
  port: number;
  ssl: boolean;
  schema: string;
}
/**
 * Shows the type of an API configuration
 * @notExported
 */
interface Config {
  organization: string;
  organizationVaultSecret: string;
  port: number;
  rootSecret: string;
  // RPC is the mutlichain daemon
  rpc: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
  // Blockchain is the blockchain component of Trubudget
  // It serves e.g. backup or version endpoints
  blockchain: {
    host: string;
    port: number;
  };
  jwt: JwtConfig;
  npmPackageVersion: string;
  // Continues Integration
  ciCommitSha: string;
  buildTimeStamp: string;
  documentFeatureEnabled: boolean;
  documentExternalLinksEnabled: boolean;
  storageService: {
    host: string;
    port: number;
    externalUrl: string;
  };
  emailService: {
    host: string;
    port: number;
  };
  encryptionPassword: string | undefined;
  signingMethod: string;
  nodeEnv: string | undefined;
  accessControlAllowOrigin: string;
  rateLimit: number | undefined;
  authProxy: {
    enabled: boolean;
    authProxyCookie: string;
    jwsSignature: string | undefined;
  };
  db: DatabaseConfig;
  dbType: string;
  sqlDebug: boolean | undefined;
  refreshTokensTable: string | undefined;
  refreshTokenStorage: string | undefined;
  snapshotEventInterval: number;
  azureMonitorConnectionString: string;
  silenceLoggingOnFrequentRoutes: boolean;
}

const envVarsSchema = Joi.object({
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
  RATE_LIMIT: Joi.number(),
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
  APPLICATIONINSIGHTS_CONNECTION_STRING: Joi.string().default(""),
})
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

/**
 * environment variables which are required by the API
 * @notExported
 */
const requiredEnvVars = ["ORGANIZATION", "ORGANIZATION_VAULT_SECRET"];

export const config: Config = {
  organization: envVars.ORGANIZATION,
  organizationVaultSecret: envVars.ORGANIZATION_VAULT_SECRET,
  port: envVars.PORT,
  rootSecret: envVars.ROOT_SECRET,
  // RPC is the mutlichain daemon
  rpc: {
    host: envVars.MULTICHAIN_RPC_HOST,
    port: envVars.MULTICHAIN_RPC_PORT,
    user: envVars.MULTICHAIN_RPC_USER,
    password: envVars.MULTICHAIN_RPC_PASSWORD,
  },
  // Blockchain is the blockchain component of Trubudget
  // It serves e.g. backup or version endpoints
  blockchain: {
    host: envVars.MULTICHAIN_RPC_HOST,
    port: envVars.BLOCKCHAIN_PORT,
  },
  jwt: {
    secretOrPrivateKey: envVars.JWT_SECRET,
    publicKey: envVars.JWT_PUBLIC_KEY,
    algorithm: envVars.JWT_ALGORITHM,
  },
  npmPackageVersion: process.env.npm_package_version || "",
  // Continues Integration
  ciCommitSha: process.env.CI_COMMIT_SHA || "",
  buildTimeStamp: process.env.BUILDTIMESTAMP || "",
  documentFeatureEnabled: envVars.DOCUMENT_FEATURE_ENABLED,
  documentExternalLinksEnabled: envVars.DOCUMENT_EXTERNAL_LINKS_ENABLED,
  storageService: {
    host: envVars.STORAGE_SERVICE_HOST,
    port: envVars.STORAGE_SERVICE_PORT,
    externalUrl: envVars.STORAGE_SERVICE_EXTERNAL_URL,
  },
  emailService: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
  },
  encryptionPassword: envVars.ENCRYPTION_PASSWORD,
  signingMethod: envVars.SIGNING_METHOD,
  nodeEnv: envVars.NODE_ENV,
  accessControlAllowOrigin: envVars.ACCESS_CONTROL_ALLOW_ORIGIN,
  rateLimit: envVars.RATE_LIMIT,
  authProxy: {
    enabled: envVars.AUTHPROXY_ENABLED,
    authProxyCookie: "authorizationToken",
    jwsSignature: envVars.AUTHPROXY_JWS_SIGNATURE,
  },
  db: {
    user: envVars.API_DB_USER,
    password: envVars.API_DB_PASSWORD,
    host: envVars.API_DB_HOST,
    database: envVars.API_DB_NAME,
    port: envVars.API_DB_PORT,
    ssl: envVars.API_DB_SSL,
    schema: envVars.API_DB_SCHEMA,
  },
  dbType: envVars.DB_TYPE,
  sqlDebug: envVars.SQL_DEBUG,
  refreshTokensTable: envVars.API_REFRESH_TOKENS_TABLE,
  refreshTokenStorage: envVars.REFRESH_TOKEN_STORAGE,
  snapshotEventInterval: envVars.SNAPSHOT_EVENT_INTERVAL,
  azureMonitorConnectionString: envVars.APPLICATIONINSIGHTS_CONNECTION_STRING,
  silenceLoggingOnFrequentRoutes: envVars.SILENCE_LOGGING_ON_FREQUENT_ROUTES,
};

/**
 * Checks if required environment variables are set, stops the process otherwise
 * @notExported
 *
 * @param requiredEnvVars environment variables required for the API to run
 */
function exitIfMissing(requiredEnvVars): void {
  let envVarMissing = false;
  requiredEnvVars.forEach((env) => {
    if (!envExists(process.env, env)) envVarMissing = true;
  });
  if (envVarMissing) process.exit(1);
}

/**
 * Checks if an environment variable is attached to the current process
 * @notExported
 *
 * @param processEnv environment variables attached to the current process
 * @param prop environment variable to check
 * @param msg optional message to print out
 * @returns a boolean indicating if an environment variable is attached to the current process
 */
const envExists = <T, K extends keyof T>(
  processEnv: Partial<T>,
  prop: K,
  msg?: string,
): boolean => {
  if (processEnv[prop] === undefined || processEnv[prop] === null) {
    switch (prop) {
      case "ORGANIZATION":
        msg = "Please set ORGANIZATION to the organization this node belongs to.";
        break;
      case "ORGANIZATION_VAULT_SECRET":
        msg =
          "Please set ORGANIZATION_VAULT_SECRET to the secret key used to encrypt the organization's vault.";
        break;
      default:
        break;
    }
    logger.fatal(msg || `Environment is missing required variable ${String(prop)}`);
    return false;
  } else {
    return true;
  }
};

/**
 * Gets the configuration used to start the API
 *
 * @returns the configuration {@link Config}
 * @notExported
 */
const getValidConfig = (): Config => {
  return config;
};
/**
 * Checks if a production environment is running
 *
 * @returns true if the current environment is a production environment. otherwise false
 */
export const isProductionEnvironment = (): boolean => config.nodeEnv === "production";

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends ProcessEnvVars {}
  }
}

export default getValidConfig;
