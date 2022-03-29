import * as express from "express";
import { getInformation } from "./service/getInformation";
import { RpcClient } from "./infrastructure/RpcClient";

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
  const info: any = await getInformation(rpcClient);
  res.send("OKayyyy lets get the infos: " + JSON.stringify(info));
  // console.log(info);
});

app.get("/streams", (_req: express.Request, res: express.Response) => {
  res.status(200).send("OKayyyy lets get the streams");
});

app.listen(PORT, () =>
  console.log(`Blockchain-Explorer running on Port ${PORT} ...`),
);
