import axios, { AxiosTransformer } from "axios";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { writeXLS } from "./excel";

const apiHost: string = process.env.API_HOST || "localhost";
const apiPort: number = (process.env.API_PORT && parseInt(process.env.API_PORT, 10)) || 8080;
const serverPort: number = (process.env.PORT && parseInt(process.env.PORT, 10)) || 8888;

axios.defaults.baseURL = `http://${apiHost}:${apiPort}/api`;
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

  // create export
  try {
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=TruBudget_Export.xlsx");
    res.setHeader("Transfer-Encoding", "chunked");
    await writeXLS(axios, token, res);
  } catch (error) {
    // TODO: how to signal an error in a chunked message
    // res.statusCode = 500;
    console.error(error.message);
  } finally {
    res.end();
  }
});

console.log(`Starting TruBudget export server on ${serverPort}`);

server.listen(serverPort);
