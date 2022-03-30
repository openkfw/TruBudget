import * as express from "express";
import { getInformation } from "./service/getInformation";
import { RpcClient } from "./infrastructure/RpcClient";
import { toHttpError } from "./service/http_errors";
import { MultichainInformation } from "domain/multichainInformation";

const app: express.Application = express();

const rpcClient = new RpcClient({});

// Environmental variables

const PORT: number = parseInt(process.env.PORT || "8081", 10);

// Routes

app.get("/", (_req: express.Request, res: express.Response) => {
  res.status(200).send("OKayyyy lets go");
});

app.get("/readiness", (_req: express.Request, res: express.Response) => {
  res.status(200).send(true);
});

app.get("/info", async (_req: express.Request, res: express.Response) => {
  getInformation(rpcClient)
    .then((result: MultichainInformation) => {
      res.status(200).send(result);
      // .send(" 2 OKayyyy lets get the infos: " + JSON.stringify(result));
    })
    .catch((err) => {
      const { code, body } = toHttpError(err);
      console.log("ERROR CAUGHT: " + code + " -- " + body);
      res.status(code).send(body);
    });
});

app.get("/streams", (_req: express.Request, res: express.Response) => {
  res.status(200).send("OKayyyy lets get the streams");
});

app.listen(PORT, () =>
  console.log(`Blockchain-Explorer running on Port ${PORT} ...`),
);
