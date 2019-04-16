import { writeXLS } from "./excel";
import axios, { AxiosTransformer } from "axios";
import { createServer, IncomingMessage, ServerResponse } from "http";

const apiHost: string = process.env.API_HOST || "localhost";
const apiPort: number = (process.env.API_PORT && parseInt(process.env.API_PORT, 10)) || 8080;
const serverPort: number = (process.env.API_PORT && parseInt(process.env.API_PORT, 10)) || 8888;

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
  const token = req.headers.authorization;
  if (!token) {
    res.statusCode = 403;
    return res.end();
  }

  try {
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=TruBudget_Export.xlsx");
    res.setHeader("Transfer-Encoding", "chunked");
    await writeXLS(axios, token, res);
    res.statusCode = 200;
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 500;
    res.write(error);
  } finally {
    res.end();
  }
});

console.log(`Starting export server on ${serverPort}`);

server.listen(serverPort);
