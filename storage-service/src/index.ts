import * as cors from "cors";
import * as express from "express";
import { body, query, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import { Logger } from "pino";
import * as multer from "multer";
import {
  createPinoExpressLogger,
  createPinoLogger,
} from "trubudget-logging-service";
import helmet from "helmet";
import config from "./config";
import {
  deleteDocument,
  downloadDocument,
  establishConnection,
  getStorageProviderStatus,
  uploadDocument,
} from "./storage";

interface DocumentUploadRequest extends express.Request {
  query: {
    docId: string;
  };
  body: {
    fileName: string;
    content: string;
  };
  log: Logger;
  file?: multer.Multer.File;
}
interface DocumentDownloadRequest extends express.Request {
  query: {
    docId: string;
    secret: string;
  };
  log: Logger;
}

interface DocumentDeleteRequest extends express.Request {
  query: {
    docId: string;
    secret: string;
  };
  log: Logger;
}

interface DocumentUploadResponseBody extends express.Response {
  document: {
    docId: string;
    secret: string;
  };
}

interface MultiPartRequestBody {
  fileName: string;
  content: string;
  docId: string;
}

export const log = createPinoLogger("Storage-Service");

function truncateErrors(errors: any, maxLength = 100): any {
  return errors.array().map((error: any) => {
    if (error.msg.length > maxLength) {
      return { ...error, msg: `${error.msg.substring(0, maxLength)}...` };
    }
    return error;
  });
}

// Setup
const app = express();
app.use(cors());
app.use(createPinoExpressLogger(log));
app.options(config.allowOrigin, cors());

app.use(helmet());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit || 100, // limit each IP to 100 requests per windowMs
});

if (config.rateLimit) {
  app.use(limiter);
}

const allowOrigins = config.allowOrigin.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        log.debug(msg);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  }),
);

const upload = multer({ dest: "uploads/" });
app.use(express.json({ limit: "101mb" }));
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get("/liveness", (req, res) => {
  res
    .status(200)
    .header({ "Content-Type": "application/json" })
    .send(
      JSON.stringify({
        uptime: process.uptime(),
      }),
    );
});

app.get("/readiness", async (req, res) => {
  const { status, statusText } = await getStorageProviderStatus();

  res
    .status(status)
    .header({ "Content-Type": "application/json" })
    .send(statusText);
});

app.get("/readiness", async (req, res) => {
  const { status } = await getStorageProviderStatus();
  res.status(status);
  res.send(status === 200);
});

app.get("/version", (req, res) => {
  res
    .status(200)
    .header({ "Content-Type": "application/json" })
    .send(
      JSON.stringify({
        release: process.env.npm_package_version,
        commit: process.env.CI_COMMIT_SHA || "",
        buildTimeStamp: process.env.BUILDTIMESTAMP || "",
      }),
    );
});

app.post(
  "/upload",
  express.json(),
  upload.single("file"),
  query("docId").isString(),
  body("fileName").isString(),
  // TODO should storage-service care if it gets base64 or not?
  body("content").custom((value, { req }) => {
    return true;
    // if (req.is("json")) {
    //   const isBase64 =
    //     Buffer.from(req.file.buffer, "base64").toString("base64") ===
    //     req.file.buffer;
    //   if (!isBase64) {
    //     throw new Error("File is not a base64 string");
    //   }
    // }

    // return true;
  }),
  (req: DocumentUploadRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const truncatedErrors = truncateErrors(errors);
      log.error({ err: truncatedErrors }, "Error while validating request");
      return res.status(400).json({ errors: truncatedErrors }).end();
    }

    if (req.is("json")) {
      // Handle JSON request
      const docId: string = req.query.docId;
      const { content, fileName } = req.body;

      (async (): Promise<void> => {
        log.debug({ req }, "Uploading document");
        const result = await uploadDocument(docId, content, {
          fileName,
          docId,
        });
        res.send({ docId, secret: result }).end();
      })().catch((err) => {
        if (err.code === "NoSuchBucket") {
          req.log.error(
            { err },
            "NoSuchBucket at /upload. Please restart storage-service to create a new bucket at minio/container in Azure blob storage",
          );
        }
        res.status(500).send(err).end();
      });
    } else if (req.is("multipart/form-data")) {
      // Handle multipart/form-data request
      const docId = (req.body as MultiPartRequestBody).docId;
      const file = req.file; // This is the uploaded file

      // Continue with your multipart/form-data request handling logic
    } else {
      res.status(400).send("Invalid request");
    }
  },
);

app.get(
  "/download",
  query("docId").isString(),
  (req: DocumentDownloadRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.log.error({ err: errors }, "Error while validating request");
      return res.status(404).end();
    }
    const docId: string = req.query.docId;

    // the secret should be in the headers
    const secret = req.headers.secret;
    if (!secret) {
      res.status(404).end();
    }

    // first get document
    (async (): Promise<void> => {
      req.log.debug({ req }, "Downloading document");
      const result = await downloadDocument(docId);

      //check if the given secret matches the one form the metadata
      if (result.meta.secret !== secret) {
        res.status(404).end();
      } else {
        res.send(result).end();
      }
    })().catch((err) => {
      if (err.code === "NoSuchBucket") {
        req.log.error(
          { err },
          "NoSuchBucket at /download. Please restart storage-service to create a new bucket at minio/container in Azure blob storage",
        );
      }
      res.status(404).end();
    });
  },
);

app.delete(
  "/delete",
  query("docId").isString(),
  (req: DocumentDeleteRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.log.error({ err: errors }, "Error while validating request");
      return res.status(404).end();
    }
    const docId: string = req.query.docId;

    // the secret should be in the headers
    const secret = req.headers.secret;
    if (!secret) {
      res.status(404).end();
    }

    // first get document
    (async (): Promise<void> => {
      req.log.debug({ req }, `Deleting document ${docId}`);
      const result = await downloadDocument(docId);

      //check if the given secret matches the one form the metadata
      if (result.meta.secret !== secret) {
        res.status(404).end();
      } else {
        deleteDocument(docId);
        res.send(204).end();
      }
    })().catch((err) => {
      if (err.code === "NoSuchBucket") {
        req.log.error(
          { err },
          "NoSuchBucket at /delete. Please restart storage-service to create a new bucket at minio/container in Azure blob storage",
        );
      }
      res.status(404).end();
    });
  },
);

app.listen(config.port, async () => {
  log.info(`Starting TruBudget storage server on ${config.port}`);
  await establishConnection();
});
