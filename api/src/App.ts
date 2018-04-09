import * as express from "express";
import { RpcMultichainClient } from "./multichain";
import ProjectModel from "./project";
import { authorize, authorized } from "./authz";
import { SimpleIntent } from "./authz/intents";

const multichainClient = new RpcMultichainClient({
  protocol: "http",
  host: process.env.RPC_HOST || "localhost",
  port: parseInt(process.env.RPC_PORT || "8000", 10),
  username: process.env.RPC_USER || "multichainrpc",
  password: process.env.RPC_PASS || "s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j"
});

const projectModel = new ProjectModel(multichainClient);

const app = express();

const router = express.Router();

const fun = (intent: SimpleIntent) => {
  switch (intent) {
    case "session.authenticate":
      return 1;
  }
};

router.get("/health", (req, res) => res.status(200).send("OK"));

router.get("/project.list", async (req, res) => {
  // Returns all projects the user is allowed to see
  const user = req.params.user || "alice";
  try {
    const projects = await projectModel.list(authorized(user, "project.list"));
    res.json(projects);
  } catch (err) {
    console.log(err);
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

router.post("/project.create", async (req, res) => {
  const user = req.params.user || "alice";
  try {
    await projectModel.createProject(req.body, authorized(user, "project.create"));
    res.status(201).send();
  } catch (err) {
    console.log(err);
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

app.use("/", router);

export default app;
