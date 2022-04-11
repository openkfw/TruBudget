import * as express from "express";
import * as cors from "cors";
import { body, query } from "express-validator";
import * as service from "./service/service";
import { ConnectionSettings, RpcClient } from "./infrastructure/RpcClient";
import { toHttpError } from "./service/http_errors";
import { MultichainInformation } from "domain/multichainInformation";

let Lodash = require("lodash");

// Environmental variables
const PORT: number = parseInt(process.env.PORT || "8081", 10);
const RPC_PORT: number = parseInt(process.env.RPC_PORT || "8000", 10);
const RPC_USER: string = process.env.RPC_USER || "multichainrpc";
const RPC_HOST: string = process.env.RPC_HOST || "127.0.0.1";
const RPC_PASSWORD: string =
  process.env.RPC_PASSWORD || "s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j";

// Setup ExpressJS App
const app: express.Application = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));

// Setup RPC Client for Infrastructure Layer
const rpcSettings: ConnectionSettings = {
  host: RPC_HOST,
  port: RPC_PORT,
  user: RPC_USER,
  rpcPassword: RPC_PASSWORD,
};

const rpcClient = new RpcClient(rpcSettings);

// Routes

app.get("/", (_req: express.Request, res: express.Response) => {
  res.status(200).send("OK");
});

app.get("/readiness", (_req: express.Request, res: express.Response) => {
  service
    .getInformation(rpcClient)
    .then((_result: MultichainInformation) => {
      res
        .status(200)
        .send({ blockchain: "available", "blockchain-explorer": "available" });
    })
    .catch((err) => {
      const { code, body } = toHttpError(err);
      res.status(code).send(body);
    });
});

app.get("/info", async (_req: express.Request, res: express.Response) => {
  service
    .getInformation(rpcClient)
    .then((result: MultichainInformation) => {
      res.status(200).send(result);
      // .send(" 2 OKayyyy lets get the infos: " + JSON.stringify(result));
    })
    .catch((err) => {
      const { code, body } = toHttpError(err);
      // console.log("ERROR CAUGHT: " + code + " -- " + body);
      res.status(code).send(body);
    });
});

app.get("/streams", (_req: express.Request, res: express.Response) => {
  service
    .getStreams(rpcClient)
    .then((result: any) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      const { code, body } = toHttpError(err);
      res.status(code).send(body);
    });
});

app.get(
  "/stream.getAllStreamItems",
  query("name").escape(),
  (req: express.Request, res: express.Response) => {
    service
      .getAllStreamItems(rpcClient, Lodash.toString(req.query.name))
      .then((result: any) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        const { code, body } = toHttpError(err);
        res.status(code).send(body);
      });
  },
);

app.get(
  "/stream.getNumberOfTx",
  query("name").escape(),
  (req: express.Request, res: express.Response) => {
    service
      .getNumberOfTx(rpcClient, Lodash.toString(req.query.name))
      .then((result: any) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        const { code, body } = toHttpError(err);
        res.status(code).send(body);
      });
  },
);

app.get(
  "/stream.getTxDetails",
  query("streamName", "txid").escape(),
  (req: express.Request, res: express.Response) => {
    service
      .getTxDetails(
        rpcClient,
        Lodash.toString(req.query.streamName),
        Lodash.toString(req.query.txid),
      )
      .then((result: any) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        const { code, body } = toHttpError(err);
        res.status(code).send(body);
      });
  },
);

// TruBudget routes

app.get(
  "/trubudget/metadata",
  (_req: express.Request, res: express.Response) => {
    // Number of users, projects, slave nodes, ...
    res.status(200).send("metadata");
  },
);

app.listen(PORT, () =>
  console.log(`Blockchain-Explorer running on Port ${PORT} ...`),
);
