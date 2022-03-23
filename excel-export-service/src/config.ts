interface Config {
  apiHost: string;
  apiPort: number;
  serverPort: number;
  accessControlAllowOrigin: string;
}

let apiHost: string = "localhost";
let apiPort: number = 8080;

const hasProdApiEnvVars =
  process.env.PROD_API_HOST !== undefined && process.env.PROD_API_PORT !== undefined;
const hasTestApiEnvVars =
  process.env.TEST_API_HOST !== undefined && process.env.TEST_API_PORT !== undefined;
const hasDeprecatedEnvVars =
  (process.env.API_HOST === undefined || process.env.API_PORT === undefined) &&
  (hasTestApiEnvVars || hasProdApiEnvVars);

if (hasDeprecatedEnvVars) {
  console.log(
    "Env var 'TEST_API_HOST' and 'PROD_API_HOST' are deprecated. Use env var 'API_HOST' and 'API_PORT' instead",
  );
  if (hasProdApiEnvVars) {
    console.log("Use PROD_API_HOST as API_HOST and PROD_API_PORT as API_PORT");
    apiHost = process.env.PROD_API_HOST || "localhost";
    apiPort = (process.env.PROD_API_PORT && parseInt(process.env.PROD_API_PORT, 10)) || 8080;
  } else if (hasTestApiEnvVars) {
    console.log("Use TEST_API_HOST as API_HOST and TEST_API_PORT as API_PORT");
    apiHost = process.env.TEST_API_HOST || "localhost";
    apiPort = (process.env.TEST_API_PORT && parseInt(process.env.TEST_API_PORT, 10)) || 8080;
  }
} else {
  apiHost = process.env.API_HOST || "localhost";
  apiPort = (process.env.API_PORT && parseInt(process.env.API_PORT, 10)) || 8080;
}

export const config: Config = {
  apiHost,
  apiPort,
  serverPort: (process.env.PORT && parseInt(process.env.PORT, 10)) || 8888,
  accessControlAllowOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
};
