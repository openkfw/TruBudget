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
  EMAIL_PROTOCOL: "http" | "https";
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
    protocol: "http" | "https";
    user: string;
    password: string;
  };
  // Blockchain is the blockchain component of Trubudget
  // It serves e.g. backup or version endpoints
  blockchain: {
    host: string;
    port: number;
    protocol: "http" | "https";
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
    protocol: "http" | "https";
    externalUrl: string;
  };
  emailService: {
    host: string;
    port: number;
    protocol: "http" | "https";
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

/**
 * environment variables which are required by the API
 * @notExported
 */
const requiredEnvVars = ["ORGANIZATION", "ORGANIZATION_VAULT_SECRET"];

export const config: Config = {
  organization: process.env.ORGANIZATION || "",
  organizationVaultSecret: process.env.ORGANIZATION_VAULT_SECRET || "",
  port: Number(process.env.PORT) || 8080,
  rootSecret: process.env.ROOT_SECRET || randomString(32),
  // RPC is the mutlichain daemon
  rpc: {
    host: process.env.MULTICHAIN_RPC_HOST || "localhost",
    port: Number(process.env.MULTICHAIN_RPC_PORT) || 8000,
    protocol: process.env.MULTICHAIN_RPC_PROTOCOL === "https" ? "https" : "http",
    user: process.env.MULTICHAIN_RPC_USER || "multichainrpc",
    password: process.env.MULTICHAIN_RPC_PASSWORD || "s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j",
  },
  // Blockchain is the blockchain component of Trubudget
  // It serves e.g. backup or version endpoints
  blockchain: {
    host: process.env.MULTICHAIN_RPC_HOST || "localhost",
    port: Number(process.env.BLOCKCHAIN_PORT) || 8085,
    protocol: process.env.BLOCKCHAIN_PROTOCOL === "https" ? "https" : "http",
  },
  jwt: {
    secretOrPrivateKey: process.env.JWT_SECRET || randomString(32),
    publicKey: process.env.JWT_PUBLIC_KEY || "",
    algorithm: process.env.JWT_ALGORITHM === "RS256" ? "RS256" : "HS256",
  },
  npmPackageVersion: process.env.npm_package_version || "",
  // Continues Integration
  ciCommitSha: process.env.CI_COMMIT_SHA || "",
  buildTimeStamp: process.env.BUILDTIMESTAMP || "",
  documentFeatureEnabled: process.env.DOCUMENT_FEATURE_ENABLED === "true" ? true : false,
  documentExternalLinksEnabled:
    process.env.DOCUMENT_EXTERNAL_LINKS_ENABLED === "true" ? true : false,
  storageService: {
    host: process.env.STORAGE_SERVICE_HOST || "localhost",
    port: Number(process.env.STORAGE_SERVICE_PORT) || 8090,
    protocol: process.env.STORAGE_SERVICE_PROTOCOL === "https" ? "https" : "http",
    externalUrl: process.env.STORAGE_SERVICE_EXTERNAL_URL || "",
  },
  emailService: {
    host: process.env.EMAIL_HOST || "localhost",
    port: Number(process.env.EMAIL_PORT) || 8089,
    protocol: process.env.EMAIL_PROTOCOL === "https" ? "https" : "http",
  },
  encryptionPassword:
    process.env.ENCRYPTION_PASSWORD === "" ? undefined : process.env.ENCRYPTION_PASSWORD,
  signingMethod: process.env.SIGNING_METHOD || "node",
  nodeEnv: process.env.NODE_ENV || "production",
  accessControlAllowOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
  rateLimit:
    process.env.RATE_LIMIT === "" || isNaN(Number(process.env.RATE_LIMIT))
      ? undefined
      : Number(process.env.RATE_LIMIT),
  authProxy: {
    enabled: process.env.AUTHPROXY_ENABLED === "true" || false,
    authProxyCookie: "authorizationToken",
    jwsSignature: process.env.AUTHPROXY_JWS_SIGNATURE || undefined,
  },
  db: {
    user: process.env.API_DB_USER || "postgres",
    password: process.env.API_DB_PASSWORD || "test",
    host: process.env.API_DB_HOST || "localhost",
    database: process.env.API_DB_DATABASE || "trubudget_email_service",
    port: Number(process.env.API_DB_PORT) || 5432,
    ssl: process.env.API_DB_SSL === "true",
    schema: process.env.API_DB_SCHEMA || "public",
  },
  dbType: process.env.DB_TYPE || "pg",
  sqlDebug: Boolean(process.env.SQL_DEBUG) || false,
  refreshTokensTable: process.env.API_REFRESH_TOKENS_TABLE || "refresh_token",
  refreshTokenStorage:
    process.env.REFRESH_TOKEN_STORAGE &&
    ["db", "memory"].includes(process.env.REFRESH_TOKEN_STORAGE)
      ? process.env.REFRESH_TOKEN_STORAGE
      : undefined,
  snapshotEventInterval: Number(process.env.SNAPSHOT_EVENT_INTERVAL) || 3,
  azureMonitorConnectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "",
  silenceLoggingOnFrequentRoutes:
    process.env.SILENCE_LOGGING_ON_FREQUENT_ROUTES === "true" || false,
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
  exitIfMissing(requiredEnvVars);

  // Environment Validation
  const jwtSecret: string = process.env.JWT_SECRET || randomString(32);
  if (jwtSecret.length < 32) {
    logger.warn("Warning: the JWT secret key should be at least 32 characters long.");
  }
  const rootSecret: string = process.env.ROOT_SECRET || randomString(32);
  if (!process.env.ROOT_SECRET) {
    logger.warn(`Warning: root password not set; autogenerated to ${rootSecret}`);
  }

  // Document feature enabled
  if (process.env.DOCUMENT_FEATURE_ENABLED === "true") {
    const requiredDocEnvVars = ["STORAGE_SERVICE_EXTERNAL_URL"];
    exitIfMissing(requiredDocEnvVars);
  }

  const jwtAlgorithm: string = process.env.JWT_ALGORITHM;
  if (
    !(
      jwtAlgorithm === "HS256" ||
      jwtAlgorithm === "RS256" ||
      jwtAlgorithm === undefined ||
      jwtAlgorithm === ""
    )
  ) {
    logger.fatal("JWT_ALGORITHM must be either HS256 or RS256 or empty (defaults to HS256)");
    process.exit(1);
  }

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
