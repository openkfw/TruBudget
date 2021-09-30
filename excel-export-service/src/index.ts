import * as express from "express";
import * as cors from "cors";
import axios, { AxiosTransformer } from "axios";
import * as URL from "url";

import { writeXLSX } from "./excel";
import strings, { languages } from "./localizeStrings";
import { config } from "./config";
import { getApiReadiness, getApiVersion } from "./api";
import { createPinoExpressLogger, createPinoLogger } from "trubudget-logging-service";

const DEFAULT_API_VERSION = "1.0";
const API_BASE_PROD = `http://${config.apiHost}:${config.apiPort}/api`;
const API_BASE_TEST = `http://${config.testApiHost}:${config.testApiPort}/api`;

const log = createPinoLogger("Excel-Export-Service");

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

const excelService = express();
excelService.use(createPinoExpressLogger(log));
excelService.use(express.json());
excelService.use(cors({ origin: config.accessControlAllowOrigin }));
excelService.use((req: express.Request, res: express.Response, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
});

// This can be removed once prod and test env option will be removed https://github.com/openkfw/TruBudget/issues/954
excelService.use((req: express.Request, res: express.Response, next) => {
  res.apiBase = req.url.includes("/test") ? API_BASE_TEST : API_BASE_PROD;
  req.url = req.url.replace("/test", "").replace("/prod", "");
  next();
});

excelService.get("/readiness", async (req: express.Request, res: express.Response) => {
  try {
    const ready = await getApiReadiness(axios, res.apiBase);
    res.status(200).send(ready);
  } catch (err) {
    req.log.error({ err }, "API readiness call failed");
    res.end();
  }
});

excelService.get("/health", (req: express.Request, res: express.Response) => {
  res.end();
});

excelService.get("/version", (req: express.Request, res: express.Response) => {
  res.status(200).send(
    JSON.stringify({
      release: process.env.npm_package_version,
      commit: process.env.CI_COMMIT_SHA || "",
      buildTimeStamp: process.env.BUILDTIMESTAMP || "",
    }),
  );
});

excelService.get("/download", async (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).send("Please provide authorization token");
  }

  try {
    await getApiVersion(axios, token, res.apiBase);
  } catch (err) {
    if (err.response?.status == 401) {
      req.log.error({ err }, "Invalid Token:");
      res.status(err.response.status).send({ message: err.response.data });
    } else {
      req.log.error({ err }, "Error validating token");
      res.status(err.response.status).send({ message: `Error validating token: ${err.response} ` });
    }
  }

  setExcelLanguage(req.url);

  // create export
  try {
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=TruBudget_Export.xlsx");
    res.setHeader("Transfer-Encoding", "chunked");

    await writeXLSX(axios, req.headers.authorization, res, req.log);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send({ message: error.response.data });
    }
  }
});

excelService.listen(config.serverPort, () => log.info(`App listening on ${config.serverPort}`));

// Enable useful traces of unhandled-promise warnings:
process.on("unhandledRejection", (err) => {
  log.error({ err }, "UNHANDLED PROMISE REJECTION");
  process.exit(1);
});

function setExcelLanguage(url: string): void {
  const queryData = URL.parse(url, true).query;

  if (queryData.lang) {
    languages.map((language) => {
      if (queryData.lang === language) {
        strings.setLanguage(queryData.lang);
      }
    });
  } else strings.setLanguage("en");
}
