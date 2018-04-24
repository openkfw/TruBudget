import * as express from "express";

import { authorized } from "../authz";
import ProjectModel from "../project";
import SubprojectModel from "../subproject";
import { MultichainClient } from "../multichain";
import { GlobalModel } from "../global/model";
import Intent from "../authz/intents";
import { findBadKeysInObject, isNonemptyString } from "../lib";
import { getSubprojectList } from "../subproject/list";
import { HttpResponse, AuthenticatedRequest } from "./lib";
import { getSubprojectDetails } from "../subproject/viewDetails";
import { createWorkflowitem } from "../subproject/createWorkflowitem";
import { getWorkflowitemList } from "../workflowitem/list";
import { createUser } from "../global/createUser";
import { getUserList } from "../user/list";
import { authenticateUser } from "../user/authenticate";

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
            message: `User ${req.token.userId} is not authorized.`
          }
        }
      ]);
      break;

    case "UserAlreadyExists":
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message: `The user already exists.` }
        }
      ]);
      break;

    case "ParseError":
      send(res, [
        400,
        {
          apiVersion: "1.0",
          error: { code: 400, message: `Missing keys: ${err.badKeys.join(", ")}` }
        }
      ]);
      break;

    case "AuthenticationError":
      send(res, [
        401,
        {
          apiVersion: "1.0",
          error: { code: 401, message: "Authentication failed" }
        }
      ]);
      break;

    case "NotFound":
      send(res, [
        404,
        {
          apiVersion: "1.0",
          error: { code: 404, message: "Not found." }
        }
      ]);
      break;

    default:
      // handle RPC errors, too:
      if (err.code === -708) {
        send(res, [
          404,
          {
            apiVersion: "1.0",
            error: { code: 404, message: "Not found." }
          }
        ]);
      } else {
        send(res, [
          500,
          {
            apiVersion: "1.0",
            error: { code: 500, message: "INTERNAL SERVER ERROR" }
          }
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
  rootSecret: string
) => {
  const projectModel = new ProjectModel(multichainClient);
  const subprojectModel = new SubprojectModel(multichainClient);
  const globalModel = new GlobalModel(multichainClient);

  const router = express.Router();

  router.get("/health", (req, res) => res.status(200).send("OK"));

  router.get("/global.intent.list", async (req: AuthenticatedRequest, res) => {
    const intent = "global.intent.list";
    try {
      const response = {
        apiVersion: apiVersion,
        data: await globalModel.listPermissions(authorized(req.token, intent))
      };
      send(res, [201, response]);
    } catch (err) {
      handleError(req, res, err);
    }
  });

  router.post("/global.intent.grantPermission", async (req: AuthenticatedRequest, res) => {
    const { body, path } = req;
    const intent: Intent = "global.intent.grantPermission";

    try {
      // Validate input:
      if (body.apiVersion !== "1.0") throwParseError(["apiVersion"]);
      throwParseErrorIfUndefined(body, ["data"]);
      throwParseErrorIfUndefined(body, ["data", "intent"]);
      const intentToGrant = body.data.intent;
      throwParseErrorIfUndefined(body, ["data", "user"]);
      const targetUser = body.data.user;

      // Compute the data:
      await globalModel.grantPermissions(authorized(req.token, intent), intentToGrant, targetUser);

      // Create and send the response:
      const response = {
        apiVersion: "1.0",
        data: "Permission granted."
      };
      send(res, [201, response]);
    } catch (err) {
      handleError(req, res, err);
    }
  });

  router.get("/user.create", (req: AuthenticatedRequest, res) => {
    createUser(multichainClient, req, jwtSecret, rootSecret)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/user.list", (req: AuthenticatedRequest, res) => {
    getUserList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/user.authenticate", (req: AuthenticatedRequest, res) => {
    authenticateUser(multichainClient, req, jwtSecret, rootSecret)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/project.list", async (req: AuthenticatedRequest, res) => {
    // Returns all projects the user is allowed to see
    const intent = "project.viewSummary";
    try {
      const projects = await projectModel.list(req.token, authorized(req.token, intent));
      send(res, [
        200,
        {
          apiVersion: apiVersion,
          data: {
            items: projects
          }
        }
      ]);
    } catch (err) {
      handleError(req, res, err);
    }
  });

  router.get("/project.intent.list", async (req: AuthenticatedRequest, res) => {
    const intent = "project.intent.list";
    const projectId = req.query.projectId;
    try {
      if (!projectId) throw { kind: "ParseError", badKeys: ["projectId"] };

      const response = {
        apiVersion: apiVersion,
        data: await projectModel.listPermissions(projectId, authorized(req.token, intent))
      };
      send(res, [200, response]);
    } catch (err) {
      handleError(req, res, err);
    }
  });

  router.post("/project.intent.grantPermission", async (req: AuthenticatedRequest, res) => {
    const { body, path } = req;
    const intent: Intent = "project.intent.grantPermission";

    try {
      // Validate input:
      if (body.apiVersion !== "1.0") throwParseError(["apiVersion"]);
      throwParseErrorIfUndefined(body, ["data"]);
      throwParseErrorIfUndefined(body, ["data", "projectId"]);
      const projectId = body.data.projectId;
      throwParseErrorIfUndefined(body, ["data", "intent"]);
      const intentToGrant = body.data.intent;
      throwParseErrorIfUndefined(body, ["data", "user"]);
      const targetUser = body.data.user;

      // Compute the data:
      const isUpdate = await projectModel.grantPermissions(
        authorized(req.token, intent),
        projectId,
        intentToGrant,
        targetUser
      );

      // Create and send the response:
      const response = {
        apiVersion: "1.0",
        data: isUpdate ? "Permission granted." : "Permission already set."
      };
      send(res, [isUpdate ? 201 : 200, response]);
    } catch (err) {
      handleError(req, res, err);
    }
  });

  router.get("/project.viewDetails", async (req: AuthenticatedRequest, res) => {
    const intent = "project.viewDetails";
    const { projectId } = req.query;
    try {
      if (!projectId) throw { kind: "ParseError", badKeys: ["projectId"] };

      const project = await projectModel.details(
        req.token,
        projectId,
        authorized(req.token, intent)
      );

      const response = {
        apiVersion: apiVersion,
        data: {
          ...project
        }
      };

      send(res, [200, response]);
    } catch (err) {
      handleError(req, res, err);
    }
  });

  router.post("/project.create", async (req: AuthenticatedRequest, res) => {
    console.log;
    const body = req.body;
    console.log(`body: ${JSON.stringify(body)}`);
    if (body.apiVersion !== apiVersion) {
      send(res, [
        412,
        {
          apiVersion: body.apiVersion,
          error: { code: 412, message: `API version ${body.apiVersion} not implemented.` }
        }
      ]);

      return;
    }
    if (!body.data) {
      send(res, [
        400,
        {
          apiVersion: body.apiVersion,
          error: { code: 400, message: `Expected "data" in body.` }
        }
      ]);
      return;
    }

    const intent = "global.createProject";
    try {
      const id = await projectModel.createProject(
        req.token,
        body.data,
        authorized(req.token, intent),
        globalModel
      );
      const response = {
        apiVersion: apiVersion,
        data: id
      };
      send(res, [201, response]);
    } catch (err) {
      handleError(req, res, err);
    }
  });

  router.post("/project.createSubproject", async (req: AuthenticatedRequest, res) => {
    const { path, token, body } = req;
    const intent = "project.createSubproject";
    try {
      await subprojectModel.create(token, body.data, authorized(token, intent));
      const response = {
        apiVersion: apiVersion,
        data: {
          created: true
        }
      };
      send(res, [201, response]);
    } catch (err) {
      handleError(req, res, err);
    }
  });

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

  router.post("/subproject.createWorkflowitem", (req: AuthenticatedRequest, res) => {
    createWorkflowitem(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.get("/workflowitem.list", (req: AuthenticatedRequest, res) => {
    getWorkflowitemList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  return router;
};
