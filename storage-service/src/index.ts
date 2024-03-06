import * as cors from "cors";
import * as express from "express";
import { body, query, validationResult } from "express-validator";
import { Logger } from "pino";
import {
  createPinoExpressLogger,
  createPinoLogger,
} from "trubudget-logging-service";
import helmet from "helmet";
import config from "./config";
import {
  deleteDocument,
  downloadAsPromised,
  establishConnection,
  getMinioStatus,
  uploadAsPromised,
} from "./minio";

interface DocumentUploadRequest extends express.Request {
  query: {
    docId: string;
  };
  body: {
    fileName: string;
    content: string;
  };
  log: Logger;
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

export const log = createPinoLogger("Storage-Service");

// Setup
const app = express();
app.use(cors());
app.use(createPinoExpressLogger(log));
app.options(config.allowOrigin, cors());

app.use(helmet());

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
app.use(express.json({ limit: "75mb" }));
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
  const { status, statusText } = await getMinioStatus();

  res
    .status(status)
    .header({ "Content-Type": "application/json" })
    .send(statusText);
});

app.get("/readiness", async (req, res) => {
  const { status } = await getMinioStatus();
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
  query("docId").isString(),
  body("content").isString().isBase64(),
  body("fileName").isString(),
  (req: DocumentUploadRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log.error({ err: errors }, "Error while validating request");
      return res.status(400).json({ errors: errors.array() }).end();
    }

    const docId: string = req.query.docId;
    const { content, fileName } = req.body;

    (async (): Promise<void> => {
      log.debug({ req }, "Uploading document");
      const result = await uploadAsPromised(docId, content, {
        fileName,
        docId,
      });
      res.send({ docId, secret: result }).end();
    })().catch((err) => {
      if (err.code === "NoSuchBucket") {
        req.log.error(
          { err },
          "NoSuchBucket at /upload. Please restart storage-service to create a new bucket at minio",
        );
      }
      res.status(500).send(err).end();
    });
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
      const result = await downloadAsPromised(docId);

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
          "NoSuchBucket at /download. Please restart storage-service to create a new bucket at minio",
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
      const result = await downloadAsPromised(docId);

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
          "NoSuchBucket at /delete. Please restart storage-service to create a new bucket at minio",
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
