import axios, { AxiosTransformer } from "axios";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { writeXLS } from "./excel";

const apiHost: string = process.env.PROD_API_HOST || "localhost";
const apiPort: number =
  (process.env.PROD_API_PORT && parseInt(process.env.PROD_API_PORT, 10)) || 8080;
const testApiHost: string = process.env.TEST_API_HOST || "localhost";
const testApiPort: number =
  (process.env.TEST_API_PORT && parseInt(process.env.TEST_API_PORT, 10)) || 8080;
const serverPort: number = (process.env.PORT && parseInt(process.env.PORT, 10)) || 8888;

const DEFAULT_API_VERSION = "1.0";

const transformRequest: AxiosTransformer = data => {
  if (typeof data === "object") {
    return {
      apiVersion: DEFAULT_API_VERSION,
      data: { ...data },
    };
  } else {
    return data;
  }
};

axios.defaults.transformRequest = [transformRequest];

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization");
  if (req.method === "OPTIONS") {
    return res.end();
  }
  // readiness and health endpoint
  if (req.url === "/health" || req.url === "/readiness") {
    return res.end();
  }

  // check if token is provided
  const token = req.headers.authorization;
  if (!token) {
    res.statusCode = 401;
    res.write("Please provide authorization token");
    return res.end();
  }

  const isTest = req.url === "/test";
  const isProd = req.url === "/prod";

  if (isTest || isProd) {
    // create export
    try {
      const base = isTest
        ? `http://${testApiHost}:${testApiPort}/api`
        : `http://${apiHost}:${apiPort}/api`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader("Content-Disposition", "attachment; filename=TruBudget_Export.xlsx");
      res.setHeader("Transfer-Encoding", "chunked");

      await writeXLS(axios, token, res, base);
    } catch (error) {
      console.error(error.message);
    }
  }
  res.end();
});

console.log(`Starting TruBudget export server on ${serverPort}`);

server.listen(serverPort);
