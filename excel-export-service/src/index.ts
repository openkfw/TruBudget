import axios, { AxiosTransformer } from "axios";
import { createServer, IncomingMessage, ServerResponse } from "http";
import * as URL from "url";

import { writeXLSX } from "./excel";
import strings, { languages } from "./localizeStrings";

let apiHost: string = "localhost";
let apiPort: number = 8080;

const hasProdApiEnvVars = (process.env.PROD_API_HOST !== undefined && process.env.PROD_API_PORT !== undefined);
const hasTestApiEnvVars = (process.env.TEST_API_HOST !== undefined && process.env.TEST_API_PORT !== undefined);
const hasDeprecatedEnvVars = (process.env.API_HOST === undefined || process.env.API_PORT === undefined) && (hasTestApiEnvVars || hasProdApiEnvVars);

if (hasDeprecatedEnvVars) {
  console.log("Env var 'TEST_API_HOST' and 'PROD_API_HOST' are deprecated. Use env var 'API_HOST' and 'API_PORT' instead");
  if (hasProdApiEnvVars) {
    console.log("Use PROD_API_HOST as API_HOST and PROD_API_PORT as API_PORT")
    apiHost = process.env.PROD_API_HOST || "localhost";
    apiPort = (process.env.PROD_API_PORT && parseInt(process.env.PROD_API_PORT, 10)) || 8080;
  }
  else if (hasTestApiEnvVars) {
    console.log("Use TEST_API_HOST as API_HOST and TEST_API_PORT as API_PORT")
    apiHost = process.env.TEST_API_HOST || "localhost";
    apiPort = (process.env.TEST_API_PORT && parseInt(process.env.TEST_API_PORT, 10)) || 8080;
  }
} else {
  apiHost = process.env.API_HOST || "localhost";
  apiPort = (process.env.API_PORT && parseInt(process.env.API_PORT, 10)) || 8080;
}


const serverPort: number = (process.env.PORT && parseInt(process.env.PORT, 10)) || 8888;
const accessControlAllowOrigin: string = process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*";

const DEFAULT_API_VERSION = "1.0";

const setExcelLanguage = (url: string) => {
  const queryData = URL.parse(url, true).query;

  if (queryData.lang) {
    languages.map((language) => {
      if (queryData.lang === language) {
        strings.setLanguage(queryData.lang);
      }
    });
  } else strings.setLanguage("en");
};

const transformRequest: AxiosTransformer = (data) => {
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
  // enable cors
  res.setHeader("Access-Control-Allow-Origin", accessControlAllowOrigin);
  res.setHeader("Access-Control-Allow-Headers", "Authorization");
  if (req.method === "OPTIONS") {
    return res.end();
  }
  if (!req.url) {
    res.statusCode = 404;
    return res.end();
  }
  const splittedUrl: string[] = req.url.split("/");
  const endpoint = splittedUrl[splittedUrl.length - 1];
  // readiness and health endpoint
  if (endpoint === "health") {
    return res.end();
  }

  if (endpoint === "readiness") {
    // TODO: check readiness of api
    return res.end();
  }

  if (endpoint === "version") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.statusCode = 200;
    res.write(
      JSON.stringify({
        release: process.env.npm_package_version,
        commit: process.env.CI_COMMIT_SHA || "",
        buildTimeStamp: process.env.BUILDTIMESTAMP || "",
      }),
    );
    return res.end();
  }

  // check if token is provided
  const token = req.headers.authorization;
  if (!token) {
    res.statusCode = 401;
    res.write("Please provide authorization token");
    return res.end();
  }

  if (endpoint.includes("download")) {
    setExcelLanguage(req.url);

    // create export
    try {
      const base = `http://${apiHost}:${apiPort}/api`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader("Content-Disposition", "attachment; filename=TruBudget_Export.xlsx");
      res.setHeader("Transfer-Encoding", "chunked");

      await writeXLSX(axios, token, res, base);
    } catch (error) {
      console.error(error.message);
    }
  } else {
    // Unexpected request
    res.statusCode = 404;
    return res.end();
  }
  res.end();
});

console.log(`Starting TruBudget export server on ${serverPort}`);

server.listen(serverPort);
