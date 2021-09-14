interface Config {
  apiHost: string;
  apiPort: number;
  testApiHost: string;
  testApiPort: number;
  serverPort: number;
  accessControlAllowOrigin: string;
}

export const config: Config = {
  apiHost: process.env.PROD_API_HOST || "localhost",
  apiPort: (process.env.PROD_API_PORT && parseInt(process.env.PROD_API_PORT, 10)) || 8080,
  testApiHost: process.env.TEST_API_HOST || "localhost",
  testApiPort: (process.env.TEST_API_PORT && parseInt(process.env.TEST_API_PORT, 10)) || 8080,
  serverPort: (process.env.PORT && parseInt(process.env.PORT, 10)) || 8888,
  accessControlAllowOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
};
