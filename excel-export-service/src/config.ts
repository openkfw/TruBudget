interface Config {
  apiHost: string;
  apiPort: number;
  serverPort: number;
  accessControlAllowOrigin: string;
}

let apiHost: string = "localhost";
let apiPort: number = 8080;

export const config: Config = {
  apiHost,
  apiPort,
  serverPort: (process.env.PORT && parseInt(process.env.PORT, 10)) || 8888,
  accessControlAllowOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
};
