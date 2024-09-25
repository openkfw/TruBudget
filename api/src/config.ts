import { envVarsSchema } from "envVarsSchema";

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
  MULTICHAIN_RPC_PROTOCOL: "http" | "https";
  MULTICHAIN_RPC_USER: string;
  MULTICHAIN_RPC_PASSWORD: string;
  BLOCKCHAIN_PORT: string;
  BLOCKCHAIN_PROTOCOL: "http" | "https";
  JWT_ALGORITHM: string;
  JWT_SECRET: string;
  JWT_PUBLIC_KEY: string;
  CI_COMMIT_SHA: string;
  BUILDTIMESTAMP: string;
  DOCUMENT_FEATURE_ENABLED: string;
  DOCUMENT_EXTERNAL_LINKS_ENABLED: string;
  STORAGE_SERVICE_HOST: string;
  STORAGE_SERVICE_PORT: string;
  STORAGE_SERVICE_PROTOCOL: "http" | "https";
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
  secureCookie: boolean;
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

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error && process.env.NODE_ENV !== "testing") {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config: Config = {
  organization: envVars.ORGANIZATION,
  organizationVaultSecret: envVars.ORGANIZATION_VAULT_SECRET,
  port: envVars.PORT,
  rootSecret: envVars.ROOT_SECRET,
  // RPC is the mutlichain daemon
  rpc: {
    host: envVars.MULTICHAIN_RPC_HOST,
    port: envVars.MULTICHAIN_RPC_PORT,
    protocol: envVars.MULTICHAIN_RPC_PROTOCOL,
    user: envVars.MULTICHAIN_RPC_USER,
    password: envVars.MULTICHAIN_RPC_PASSWORD,
  },
  // Blockchain is the blockchain component of Trubudget
  // It serves e.g. backup or version endpoints
  blockchain: {
    host: envVars.MULTICHAIN_RPC_HOST,
    port: envVars.BLOCKCHAIN_PORT,
    protocol: envVars.BLOCKCHAIN_PROTOCOL,
  },
  jwt: {
    secretOrPrivateKey: envVars.JWT_SECRET,
    publicKey: envVars.JWT_PUBLIC_KEY,
    algorithm: envVars.JWT_ALGORITHM,
  },
  secureCookie: process.env.API_SECURE_COOKIE === "true" || process.env.NODE_ENV === "production",
  npmPackageVersion: process.env.npm_package_version || "",
  // Continues Integration
  ciCommitSha: process.env.CI_COMMIT_SHA || "",
  buildTimeStamp: process.env.BUILDTIMESTAMP || "",
  documentFeatureEnabled: envVars.DOCUMENT_FEATURE_ENABLED,
  documentExternalLinksEnabled: envVars.DOCUMENT_EXTERNAL_LINKS_ENABLED,
  storageService: {
    host: envVars.STORAGE_SERVICE_HOST,
    port: envVars.STORAGE_SERVICE_PORT,
    protocol: envVars.STORAGE_SERVICE_PROTOCOL,
    externalUrl: envVars.STORAGE_SERVICE_EXTERNAL_URL,
  },
  emailService: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    protocol: envVars.EMAIL_PROTOCOL,
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
