import logger from "./lib/logger";
import { randomString } from "./service/hash";

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
  JWT_SECRET: string;
  CI_COMMIT_SHA: string;
  BUILDTIMESTAMP: string;
  DOCUMENT_FEATURE_ENABLED: string;
  STORAGE_SERVICE_HOST: string;
  STORAGE_SERVICE_PORT: string;
  STORAGE_SERVICE_EXTERNAL_URL: string;
  ACCESS_CONTROL_ALLOW_ORIGIN: string;
  NODE_ENV: string;
  ENCRYPTION_PASSWORD: string;
  SIGNING_METHOD: string;
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
  jwtSecret: string;
  npmPackageVersion: string;
  // Continues Integration
  ciCommitSha: string;
  buildTimeStamp: string;
  swaggerBasepath: string;
  documentFeatureEnabled: boolean;
  storageService: {
    host: string;
    port: number;
    externalUrl: string;
  };
  encryptionPassword: string | undefined;
  signingMethod: string;
  nodeEnv: string | undefined;
  accessControlAllowOrigin: string;
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
    user: process.env.MULTICHAIN_RPC_USER || "multichainrpc",
    password: process.env.MULTICHAIN_RPC_PASSWORD || "s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j",
  },
  // Blockchain is the blockchain component of Trubudget
  // It serves e.g. backup or version endpoints
  blockchain: {
    host: process.env.MULTICHAIN_RPC_HOST || "localhost",
    port: Number(process.env.BLOCKCHAIN_PORT) || 8085,
  },
  jwtSecret: process.env.JWT_SECRET || randomString(32),
  npmPackageVersion: process.env.npm_package_version || "",
  // Continues Integration
  ciCommitSha: process.env.CI_COMMIT_SHA || "",
  buildTimeStamp: process.env.BUILDTIMESTAMP || "",
  // deprecated
  swaggerBasepath: "/",
  documentFeatureEnabled: process.env.DOCUMENT_FEATURE_ENABLED === "true" ? true : false,
  storageService: {
    host: process.env.STORAGE_SERVICE_HOST || "localhost",
    port: Number(process.env.STORAGE_SERVICE_PORT) || 8090,
    externalUrl: process.env.STORAGE_SERVICE_EXTERNAL_URL,
  },
  encryptionPassword:
    process.env.ENCRYPTION_PASSWORD === "" ? undefined : process.env.ENCRYPTION_PASSWORD,
  signingMethod: process.env.SIGNING_METHOD || "node",
  nodeEnv: process.env.NODE_ENV || "production",
  accessControlAllowOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
};

/**
 * Checks if required environment variables are set, stops the process otherwise
 * @notExported
 *
 * @param requiredEnvVars environment variables required for the API to run
 */
function exitIfMissing(requiredEnvVars) {
  let envVarMissing = false;
  requiredEnvVars.forEach((env: string) => {
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

  return config;
};
/**
 * Checks if a production environment is running
 *
 * @returns true if the current environment is a production environment. otherwise false
 */
export const isProductionEnvironment = () => config.nodeEnv === "production";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ProcessEnvVars {}
  }
}

export default getValidConfig;
