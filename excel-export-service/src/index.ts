import axios, { AxiosRequestTransformer } from "axios";
import * as cors from "cors";
import * as express from "express";
import { createPinoExpressLogger } from "trubudget-logging-service";
import * as URL from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { formatHttpError, getApiReadiness, getApiVersion } from "./api";
import { config } from "./config";
import { writeXLSX } from "./excel";
import strings, { languages } from "./localizeStrings";
import logger from "./logger";
import { CustomExpressRequest, CustomExpressResponse } from "./types";
import { forwardError, APIError } from "./errors";

const DEFAULT_API_VERSION = "1.0";
const API_BASE = `${config.apiProtocol}://${config.apiHost}:${config.apiPort}/api`;

const transformRequest: AxiosRequestTransformer = (data) => {
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

let corsOptions = {
  credentials: true,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  origin: function (origin: any, callback: any) {
    if (config.accessControlAllowOrigin === "*") {
      callback(null, true);
    } else if (config.accessControlAllowOrigin.split(";").includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

excelService.use(cors(corsOptions));
excelService.use((req: CustomExpressRequest, res: CustomExpressResponse, next) => {
  res.apiBase = API_BASE;
  next();
});

excelService.use(helmet());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit || 100, // limit each IP to 100 requests per windowMs
});

if (config.rateLimit) {
  excelService.use(limiter);
}

excelService.get("/liveness", (req, res) => {
  res
    .status(200)
    .header({ "Content-Type": "application/json" })
    .send(
      JSON.stringify({
        uptime: process.uptime(),
      }),
    );
});

excelService.get("/readiness", async (req: CustomExpressRequest, res: CustomExpressResponse) => {
  try {
    const response = await getApiReadiness(axios, res.apiBase);
    if (response.status === 200) {
      return res.status(200).send("Ready");
    } else {
      return res.status(504).send("Not ready. Waiting for API");
    }
  } catch (error) {
    logger.error({ error }, "Error during readiness check on API");
    return res.status(504).send("Error during readiness check");
  }
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

excelService.get(
  "/download",
  forwardError(async (req: CustomExpressRequest, res: CustomExpressResponse) => {
    if (req.cookies && req.cookies.token) {
      req.headers.authorization = req.cookies.token;
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split("; ");
      const authToken = cookies.find((cookie) => cookie.startsWith("token="));
      if (authToken) {
        req.headers.authorization = `Bearer ${authToken.split("=")[1]}`;
      }
    }
    const token = req.headers.authorization;
    if (!token) {
      req.log.error("No authorization token was provided");
      return res.status(401).send("Please provide authorization token");
    }

    try {
      await getApiVersion(axios, token, res.apiBase);
    } catch (err) {
      if (!err.response) {
        logger.error({ err }, "Cannot connect to API service");
        return res.status(503).send({ message: "Cannot connect to API service" });
      }
      if (err.response?.status == 401) {
        logger.error({ err }, "Invalid Token:");
        return res.status(err.response.status).send({ message: err.response.data });
      }
      logger.error({ err }, "Error validating token");
      return res
        .status(err.response.status)
        .send({ message: `Error validating token: ${err.response} ` });
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
        return res.status(error.response.status).send({ message: error.response.data });
      }
    }
  }),
);

// Default error handler
excelService.use(function errorHandler(
  err: Error | APIError,
  req: CustomExpressRequest,
  res: CustomExpressResponse,
  _next: express.NextFunction,
) {
  // set locals, only providing error in development
  logger.error("Error handler: " + err.message || "UNDEFINED ERROR");
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  const isPublic = (err as APIError).isPublic || false;
  const formattedErrorResponse: {
    message: string;
    stack?: string;
    stackArray?: Array<string>;
  } = {
    message: isPublic ? err.message : "Unexpected error",
  };

  if (config.NODE_ENV === "development") {
    formattedErrorResponse.stack = err.stack ? err.stack : "";
    formattedErrorResponse.stackArray = err.stack ? err.stack.split("\n") : [];
  }

  res.status(500).json(formatHttpError(formattedErrorResponse));
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
