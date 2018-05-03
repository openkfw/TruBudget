import * as express from "express";
import { createProject } from "../global/createProject";
import { createUser } from "../global/createUser";
import { grantGlobalPermission } from "../global/intent/grantPermission";
import { getGlobalPermissions } from "../global/intent/listPermissions";
import { revokeGlobalPermission } from "../global/intent/revokePermission";
import { MultichainClient } from "../multichain";
import { createSubproject } from "../project/createSubproject";
import { grantProjectPermission } from "../project/intent/grantPermission";
import { getProjectPermissions } from "../project/intent/listPermissions";
import { revokeProjectPermission } from "../project/intent/revokePermission";
import { getProjectList } from "../project/list";
import { getProjectDetails } from "../project/viewDetails";
import { createWorkflowitem } from "../subproject/createWorkflowitem";
import { grantSubprojectPermission } from "../subproject/intent/grantPermission";
import { getSubprojectPermissions } from "../subproject/intent/listPermissions";
import { revokeSubprojectPermission } from "../subproject/intent/revokePermission";
import { getSubprojectList } from "../subproject/list";
import { getSubprojectDetails } from "../subproject/viewDetails";
import { assignSubproject } from "../subproject/assign";
import { authenticateUser } from "../user/authenticate";
import { getUserList } from "../user/list";
import { closeWorkflowitem } from "../workflowitem/close";
import { grantWorkflowitemPermission } from "../workflowitem/intent/grantPermission";
import { getWorkflowitemPermissions } from "../workflowitem/intent/listPermissions";
import { revokeWorkflowitemPermission } from "../workflowitem/intent/revokePermission";
import { getWorkflowitemList } from "../workflowitem/list";
import { AuthenticatedRequest, HttpResponse } from "./lib";
import { assignWorkflowitem } from "../workflowitem/assign";

const send = (res: express.Response, httpResponse: HttpResponse) => {
  const [code, body] = httpResponse;
  res.status(code).json(body);
};

const handleError = (req: AuthenticatedRequest, res: express.Response, err: any) => {
  console.log(err);

  switch (err.kind) {
    case "NotAuthorized":
      console.log(req.token);
      send(res, [
        403,
        {
          apiVersion: "1.0",
          error: {
            code: 403,
            message: `User ${req.token.userId} is not authorized.`,
          },
        },
      ]);
      break;

    case "UserAlreadyExists":
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message: `The user already exists.` },
        },
      ]);
      break;

    case "ParseError":
      send(res, [
        400,
        {
          apiVersion: "1.0",
          error: { code: 400, message: `Missing keys: ${err.badKeys.join(", ")}` },
        },
      ]);
      break;

    case "AuthenticationError":
      send(res, [
        401,
        {
          apiVersion: "1.0",
          error: { code: 401, message: "Authentication failed" },
        },
      ]);
      break;

    case "NotFound":
      send(res, [
        404,
        {
          apiVersion: "1.0",
          error: { code: 404, message: "Not found." },
        },
      ]);
      break;

    default:
      // handle RPC errors, too:
      if (err.code === -708) {
        send(res, [
          404,
          {
            apiVersion: "1.0",
            error: { code: 404, message: "Not found." },
          },
        ]);
      } else {
        send(res, [
          500,
          {
            apiVersion: "1.0",
            error: { code: 500, message: "INTERNAL SERVER ERROR" },
          },
        ]);
      }
  }
};

const throwParseError = badKeys => {
  throw { kind: "ParseError", badKeys };
};
const throwParseErrorIfUndefined = (obj, path) => {
  try {
    const val = path.reduce((acc, x) => acc[x], obj);
    if (val === undefined) throw Error("catchme");
  } catch (_err) {
    throwParseError([path.join(".")]);
  }
};

const apiVersion = "1.0";
export const createRouter = (
  multichainClient: MultichainClient,
  jwtSecret: string,
  rootSecret: string,
) => {
  const router = express.Router();

  router.get("/health", (req, res) => res.status(200).send("OK"));

  // ------------------------------------------------------------
  //       global
  // ------------------------------------------------------------

  router.post("/global.createUser", (req: AuthenticatedRequest, res) => {
    createUser(multichainClient, req, jwtSecret, rootSecret)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/global.createProject", (req: AuthenticatedRequest, res) => {
    createProject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/global.intent.listPermissions", (req: AuthenticatedRequest, res) => {
    getGlobalPermissions(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/global.intent.grantPermission", (req: AuthenticatedRequest, res) => {
    grantGlobalPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/global.intent.revokePermission", (req: AuthenticatedRequest, res) => {
    revokeGlobalPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  // ------------------------------------------------------------
  //       user
  // ------------------------------------------------------------

  router.get("/user.list", (req: AuthenticatedRequest, res) => {
    getUserList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/user.authenticate", (req: AuthenticatedRequest, res) => {
    authenticateUser(multichainClient, req, jwtSecret, rootSecret)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  // ------------------------------------------------------------
  //       project
  // ------------------------------------------------------------

  router.get("/project.list", (req: AuthenticatedRequest, res) => {
    getProjectList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/project.viewDetails", (req: AuthenticatedRequest, res) => {
    getProjectDetails(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/project.createSubproject", (req: AuthenticatedRequest, res) => {
    createSubproject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/project.intent.listPermissions", (req: AuthenticatedRequest, res) => {
    getProjectPermissions(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/project.intent.grantPermission", (req: AuthenticatedRequest, res) => {
    grantProjectPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/project.intent.revokePermission", (req: AuthenticatedRequest, res) => {
    revokeProjectPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  // ------------------------------------------------------------
  //       subproject
  // ------------------------------------------------------------

  router.get("/subproject.list", (req: AuthenticatedRequest, res) => {
    getSubprojectList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/subproject.viewDetails", (req: AuthenticatedRequest, res) => {
    getSubprojectDetails(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/subproject.assign", (req: AuthenticatedRequest, res) => {
    assignSubproject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/subproject.createWorkflowitem", (req: AuthenticatedRequest, res) => {
    createWorkflowitem(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/subproject.intent.listPermissions", (req: AuthenticatedRequest, res) => {
    getSubprojectPermissions(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/subproject.intent.grantPermission", (req: AuthenticatedRequest, res) => {
    grantSubprojectPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/subproject.intent.revokePermission", (req: AuthenticatedRequest, res) => {
    revokeSubprojectPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  // ------------------------------------------------------------
  //      workflowitem
  // ------------------------------------------------------------

  router.get("/workflowitem.list", (req: AuthenticatedRequest, res) => {
    getWorkflowitemList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/workflowitem.assign", (req: AuthenticatedRequest, res) => {
    assignWorkflowitem(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/workflowitem.close", (req: AuthenticatedRequest, res) => {
    closeWorkflowitem(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/workflowitem.intent.listPermissions", (req: AuthenticatedRequest, res) => {
    getWorkflowitemPermissions(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/workflowitem.intent.grantPermission", (req: AuthenticatedRequest, res) => {
    grantWorkflowitemPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/workflowitem.intent.revokePermission", (req: AuthenticatedRequest, res) => {
    revokeWorkflowitemPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  return router;
};
