import * as URL from "url";
import { uploadAsPromised, downloadAsPromised } from "./minio";
import config from "./config";
import * as express from "express";
import * as cors from "cors";
import { query, body, validationResult } from "express-validator";

interface DocumentUploadRequest extends express.Request {
  query: {
    docId: string;
  };
  body: {
    fileName: string;
    content: string;
  };
}
interface DocumentDownloadRequest extends express.Request {
  query: {
    docId: string;
    secret: string;
  };
}

interface DocumentUploadResponseBody extends express.Response {
  document: {
    docId: string;
    secret: string;
  };
}

// Setup
const app = express();
app.use(cors());
app.options(config.allowOrigin, cors());

const allowOrigins = config.allowOrigin.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
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

app.get("/readiness", (req, res) => {
  res.send(true);
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
      return res.status(400).json({ errors: errors.array() }).end();
    }

    const docId: string = req.query.docId;
    const { content, fileName } = req.body;

    (async () => {
      const result = await uploadAsPromised(docId, content, {
        fileName,
        docId,
      });
      res.send({ docId, secret: result }).end();
    })().catch((error) => {
      res.status(500).send(error).end();
    });
  },
);

app.get(
  "/download",
  query("docId").isString(),
  (req: DocumentDownloadRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).end();
    }
    const docId: string = req.query.docId;

    // the secret should be in the headers
    var secret = req.headers.secret;
    if (!secret) {
      res.status(404).end();
    }

    // first get document
    (async () => {
      const result = await downloadAsPromised(docId);

      //check if the given secret matches the one form the metadata
      if (result.meta.secret !== secret) {
        res.status(404).end();
      } else {
        res.send(result).end();
      }
    })().catch((error) => {
      res.status(404).end();
    });
  },
);

app.listen(config.port, () => {
  console.log(`Starting TruBudget storage server on ${config.port}`);
});
