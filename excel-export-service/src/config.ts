import { envVarsSchema } from "./envVarsSchema";

interface Config {
  apiHost: string;
  apiPort: number;
  apiProtocol: "http" | "https";
  serverPort: number;
  accessControlAllowOrigin: string;
  rateLimit: number | undefined;
  NODE_ENV: string;
}

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config: Config = {
  apiHost: envVars.API_HOST,
  apiPort: envVars.API_PORT,
  apiProtocol: envVars.API_PROTOCOL,
  serverPort: envVars.PORT,
  accessControlAllowOrigin: envVars.ACCESS_CONTROL_ALLOW_ORIGIN,
  rateLimit: envVars.RATE_LIMIT,
  NODE_ENV: envVars.NODE_ENV,
};
