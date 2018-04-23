import * as express from "express";

import { authorized } from "../authz";
import ProjectModel from "../project";
import SubprojectModel from "../subproject";
import UserModel from "../user";
import { MultichainClient } from "../multichain";
import { GlobalModel } from "../global/model";
import Intent from "../authz/intents";

interface SuccessResponse {
  apiVersion: string;
  data: any;
}

interface ErrorResponse {
  apiVersion: string;
  error: {
    code: number;
    message: string;
  };
}

type Response = SuccessResponse | ErrorResponse;

const send = (res: express.Response, code: number, response: Response) => {
  res.status(code).json(response);
};

const handleError = (req: express.Request, res: express.Response, intent: Intent, err: any) => {
  console.log(err);

  switch (err.kind) {
    case "NotAuthorized":
      console.log(req.token);
      send(res, 403, {
        apiVersion: "1.0",
        error: {
          code: 403,
          message: `User ${req.token.userId} is not authorized to execute ${intent}`
        }
      });
      break;

    case "UserAlreadyExists":
      send(res, 409, {
        apiVersion: "1.0",
        error: { code: 409, message: `The user already exists.` }
      });
      break;

    case "ParseError":
      send(res, 400, {
        apiVersion: "1.0",
        error: { code: 400, message: `Missing keys: ${err.badKeys.join(", ")}` }
      });
      break;

    case "AuthenticationError":
      send(res, 401, {
        apiVersion: "1.0",
        error: { code: 401, message: "Authentication failed" }
      });
      break;

    default:
      // handle RPC errors, too:
      if (err.code === -708) {
        send(res, 404, {
          apiVersion: "1.0",
          error: { code: 404, message: "Not found." }
        });
      } else {
        send(res, 500, {
          apiVersion: "1.0",
          error: { code: 500, message: "INTERNAL SERVER ERROR" }
        });
      }
  }
};

const apiVersion = "1.0";
export const createRouter = (
  multichainClient: MultichainClient,
  jwtSecret: string,
  rootSecret: string
) => {
  const userModel = new UserModel(multichainClient, jwtSecret, rootSecret);
  const projectModel = new ProjectModel(multichainClient);
  const subprojectModel = new SubprojectModel(multichainClient);
  const globalModel = new GlobalModel(multichainClient);

  const router = express.Router();

  router.get("/health", (req, res) => res.status(200).send("OK"));

  router.get("/global.intent.list", async (req, res) => {
    const intent = "global.intent.list";
    try {
      const response = {
        apiVersion: apiVersion,
        data: await globalModel.listPermissions(authorized(req.token, intent))
      };
      send(res, 201, response);
    } catch (err) {
      handleError(req, res, intent, err);
    }
  });

  router.post("/global.intent.grantPermission", async (req, res) => {
    const { body, path } = req;
    const intent = "global.intent.grantPermission";

    if (body.apiVersion !== apiVersion) {
      send(res, 412, {
        apiVersion: req.body.apiVersion,
        error: { code: 412, message: `API version ${body.apiVersion} not implemented.` }
      });
      return;
    }
    if (!body.data) {
      send(res, 400, {
        apiVersion: req.body.apiVersion,
        error: { code: 400, message: `Expected "data" in body.` }
      });
      return;
    }
    try {
      const response = {
        apiVersion: apiVersion,
        data: await globalModel.grantPermissions(body.data, authorized(req.token, intent))
      };
      send(res, 201, response);
    } catch (err) {
      handleError(req, res, intent, err);
    }
  });

  router.post("/user.create", async (req, res) => {
    console.log(`req.user: ${JSON.stringify(req.user)}`);
    console.log(`req.token: ${JSON.stringify(req.token)}`);
    const body = req.body;
    console.log(`body: ${JSON.stringify(body)}`);
    if (body.apiVersion !== apiVersion) {
      send(res, 412, {
        apiVersion: req.body.apiVersion,
        error: { code: 412, message: `API version ${body.apiVersion} not implemented.` }
      });
      return;
    }
    if (!body.data) {
      send(res, 400, {
        apiVersion: req.body.apiVersion,
        error: { code: 400, message: `Expected "data" in body.` }
      });
      return;
    }

    const intent = "global.createUser";
    try {
      const response = {
        apiVersion: apiVersion,
        data: await userModel.create(body.data, authorized(req.token, intent))
      };
      send(res, 201, response);
    } catch (err) {
      handleError(req, res, intent, err);
    }
  });

  router.get("/user.list", async (req, res) => {
    try {
      const response = {
        apiVersion: "1.0",
        data: await userModel.list(req.token, authorized(req.token, "user.view"), globalModel)
      };
      send(res, 200, response);
    } catch (err) {
      handleError(req, res, "user.view", err);
    }
  });

  router.post("/user.authenticate", async (req, res) => {
    const body = req.body;
    console.log(`body: ${JSON.stringify(body)}`);
    if (body.apiVersion !== apiVersion) {
      send(res, 412, {
        apiVersion: req.body.apiVersion,
        error: { code: 412, message: `API version ${body.apiVersion} not implemented.` }
      });
      return;
    }
    if (!body.data) {
      send(res, 400, {
        apiVersion: req.body.apiVersion,
        error: { code: 400, message: `Expected "data" in body.` }
      });
      return;
    }

    try {
      console.log(body.data);
      const response = {
        apiVersion: apiVersion,
        data: await userModel.authenticate(body.data, globalModel)
      };
      console.log(response);
      send(res, 200, response);
    } catch (err) {
      handleError(req, res, "user.authenticate", err);
    }
  });

  router.get("/project.list", async (req, res) => {
    // Returns all projects the user is allowed to see
    const intent = "project.viewSummary";
    try {
      const projects = await projectModel.list(req.token, authorized(req.token, intent));
      res.json({
        apiVersion: apiVersion,
        data: {
          items: projects
        }
      });
    } catch (err) {
      handleError(req, res, intent, err);
    }
  });

  router.get("/project.intent.list", async (req, res) => {
    const intent = "project.intent.list";
    const projectId = req.query.projectId;
    try {
      if (!projectId) throw { kind: "ParseError", badKeys: ["projectId"] };

      const response = {
        apiVersion: apiVersion,
        data: await projectModel.listPermissions(projectId, authorized(req.token, intent))
      };
      send(res, 200, response);
    } catch (err) {
      handleError(req, res, intent, err);
    }
  });

  router.post("/project.intent.grantPermission", async (req, res) => {
    const { body, path } = req;
    const intent = "project.intent.grantPermission";

    if (body.apiVersion !== apiVersion) {
      send(res, 412, {
        apiVersion: req.body.apiVersion,
        error: { code: 412, message: `API version ${body.apiVersion} not implemented.` }
      });
      return;
    }
    if (!body.data) {
      send(res, 400, {
        apiVersion: req.body.apiVersion,
        error: { code: 400, message: `Expected "data" in body.` }
      });
      return;
    }
    try {
      const response = {
        apiVersion: apiVersion,
        data: await projectModel.grantPermissions(body.data, authorized(req.token, intent))
      };
      send(res, 201, response);
    } catch (err) {
      handleError(req, res, intent, err);
    }
  });

  router.get("/project.viewDetails", async (req, res) => {
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

      send(res, 200, response);
    } catch (err) {
      handleError(req, res, intent, err);
    }
  });

  router.post("/project.create", async (req, res) => {
    console.log;
    const body = req.body;
    console.log(`body: ${JSON.stringify(body)}`);
    if (body.apiVersion !== apiVersion) {
      send(res, 412, {
        apiVersion: body.apiVersion,
        error: { code: 412, message: `API version ${body.apiVersion} not implemented.` }
      });

      return;
    }
    if (!body.data) {
      send(res, 400, {
        apiVersion: body.apiVersion,
        error: { code: 400, message: `Expected "data" in body.` }
      });
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
      send(res, 201, response);
    } catch (err) {
      handleError(req, res, intent, err);
    }
  });

  router.post("/project.createSubproject", async (req, res) => {
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
      send(res, 201, response);
    } catch (err) {
      console.log(err);
      handleError(req, res, intent, err);
    }
  });

  return router;
};
