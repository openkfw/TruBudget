import * as express from "express";
import { RpcMultichainClient } from "./multichain";
import ProjectModel from "./project";
import { authorize, authorized } from "./authz";
import { SimpleIntent } from "./authz/intents";

const multichainClient = new RpcMultichainClient({
  protocol: "http",
  host: process.env.RPC_HOST || "localhost",
  port: parseInt(process.env.RPC_PORT, 10) || 8000,
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

// router.put("/:user/projects/:id", (req, res) => {
//   const user = req.params.user;
//   const title = req.body.title;
//   const projects = runIfAuthorized(user, Project.changeTitle(id, title));
//   res.json(projects);
// });

// router.post("/:user/projects/:id/subprojects/:title", (req, res) => {
//   // Create a subproject only if the user is allowed to:
//   const user = req.params.user;
//   const projectId = req.params.id;
//   const title = req.params.title; // TODO ;-)
//   const projects = authorize(user, Subproject.create(projectId, title));
//   res.json(projects);
// });

// router.get("/projects/:id/subprojects", (req, res) => {
//   const projectId = req.params.id;
//   // Lists all subprojects of a project the user is allowed to see:
//   const subProjects = Project.pick(projectId).listSubprojectsAs(user);
//   res.json(subProjects);
// });

// router.post("/projects/:projectId/subprojects/:id/workflows", (req, res) => {
//   const projectId = req.params.id;
//   // Lists all workflows of a subproject of a project the user is allowed to see:
//   const workflows = Project.pick(projectId).pickSubproject(id).listWorkflowsAs(user);
//   res.json(workflows);
// });

app.use("/", router);

export default app;
