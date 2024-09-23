interface Config {
  apiHost: string;
  apiPort: number;
  apiProtocol: "http" | "https";
  serverPort: number;
  accessControlAllowOrigin: string;
  rateLimit: number | undefined;
  NODE_ENV: string;
}

export const config: Config = {
  apiHost: process.env.API_HOST || "localhost",
  apiPort: (process.env.API_PORT && parseInt(process.env.API_PORT, 10)) || 8080,
  apiProtocol: process.env.API_PROTOCOL === "https" ? "https" : "http",
  serverPort: (process.env.PORT && parseInt(process.env.PORT, 10)) || 8888,
  accessControlAllowOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
  rateLimit:
    process.env.RATE_LIMIT === "" || isNaN(Number(process.env.RATE_LIMIT))
      ? undefined
      : Number(process.env.RATE_LIMIT),
  NODE_ENV: process.env.NODE_ENV || "production",
};
