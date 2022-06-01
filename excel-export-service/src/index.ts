import axios, { AxiosTransformer } from "axios";
import * as cors from "cors";
import * as express from "express";
import { createPinoExpressLogger } from "trubudget-logging-service";
import * as URL from "url";
import { getApiReadiness, getApiVersion } from "./api";
import { config } from "./config";
import { writeXLSX } from "./excel";
import strings, { languages } from "./localizeStrings";
import logger from "./logger";
import { CustomExpressRequest, CustomExpressResponse } from "./types";

const DEFAULT_API_VERSION = "1.0";
const API_BASE = `http://${config.apiHost}:${config.apiPort}/api`;

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
excelService.use(createPinoExpressLogger(logger));
excelService.use(express.json());
excelService.use(cors({ origin: config.accessControlAllowOrigin }));
excelService.use((req: CustomExpressRequest, res: CustomExpressResponse, next) => {
  res.apiBase = API_BASE;
  next();
});
excelService.use((req: CustomExpressRequest, res: CustomExpressResponse, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
});

excelService.get("/readiness", async (req: CustomExpressRequest, res: CustomExpressResponse) => {
  try {
    const ready = await getApiReadiness(axios, res.apiBase);
    res.status(200).send(ready);
  } catch (err) {
    logger.error({ err }, "API readiness call failed");
    res.end();
  }
});

excelService.get("/health", (req: CustomExpressRequest, res: CustomExpressResponse) => {
  res.end();
});

excelService.get("/version", (req: CustomExpressRequest, res: CustomExpressResponse) => {
  res.status(200).send(
    JSON.stringify({
      release: process.env.npm_package_version,
      commit: process.env.CI_COMMIT_SHA || "",
      buildTimeStamp: process.env.BUILDTIMESTAMP || "",
    }),
  );
});

excelService.get("/download", async (req: CustomExpressRequest, res: CustomExpressResponse) => {
  const token = req.headers.authorization;
  if (!token) {
    req.log.error("No authorization token was provided");
    return res.status(401).send("Please provide authorization token");
  }

  try {
    await getApiVersion(axios, token, res.apiBase);
  } catch (err) {
    if (err.response?.status == 401) {
      logger.error({ err }, "Invalid Token:");
      res.status(err.response.status).send({ message: err.response.data });
    } else {
      logger.error({ err }, "Error validating token");
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

    await writeXLSX(axios, token, res);
  } catch (error) {
    req.log.error({ err: error }, "Error while creating excel export");
    if (error.response) {
      res.status(error.response.status).send({ message: error.response.data });
    }
  }
});

excelService.listen(config.serverPort, () => logger.info(`App listening on ${config.serverPort}`));

// Enable useful traces of unhandled-promise warnings:
process.on("unhandledRejection", (err) => {
  logger.fatal({ err }, "UNHANDLED PROMISE REJECTION");
  process.exit(1);
});

function setExcelLanguage(url: string): void {
  logger.debug({ url }, "Set excel language based on url");
  const queryData = URL.parse(url, true).query;

  if (queryData.lang) {
    languages.map((language) => {
      if (queryData.lang === language) {
        strings.setLanguage(queryData.lang);
      }
    });
  } else strings.setLanguage("en");
}
