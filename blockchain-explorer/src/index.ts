import * as express from "express";
import { body, query } from "express-validator";
import * as service from "./service/service";
import { RpcClient } from "./infrastructure/RpcClient";
import { toHttpError } from "./service/http_errors";
import { MultichainInformation } from "domain/multichainInformation";
// eslint-disable-next-line no-var
var Lodash = require("lodash");

const app: express.Application = express();

const rpcClient = new RpcClient({});

// Environmental variables

const PORT: number = parseInt(process.env.PORT || "8081", 10);

// Routes

app.get("/", (_req: express.Request, res: express.Response) => {
  res.status(200).send("OKayyyy lets go");
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
  "/stream.getNumberOfTx",
  query("id").escape(),
  (req: express.Request, res: express.Response) => {
    service
      .getNumberOfTx(rpcClient, Lodash.toString(req.query.id))
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
