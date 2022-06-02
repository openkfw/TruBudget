interface Config {
  apiHost: string;
  apiPort: number;
  serverPort: number;
  accessControlAllowOrigin: string;
}

export const config: Config = {
  apiHost: process.env.API_HOST || "localhost",
  apiPort: (process.env.API_PORT && parseInt(process.env.API_PORT, 10)) || 8080,
  serverPort: (process.env.PORT && parseInt(process.env.PORT, 10)) || 8888,
  accessControlAllowOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
};
