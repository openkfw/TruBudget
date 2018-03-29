import * as express from "express";
import * as Project from "./project";
import { Project as ProjectType } from "./project/types";
import { filter as authorized } from "./authz";

const app = express();

const router = express.Router();

router.get("/:user/projects", (req, res) => {
  // Returns all projects the user is allowed to see
  const user = req.params.user;
  const projects = Project.list()
    .filter(authorized(user, "view"))
    .map(Project.unwrap);
  res.json(projects);
});

// router.post("/projects", (req, res) => {
//   // Create a project only if the user is allowed to:
//   const projects = Project.createAs(user);
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
