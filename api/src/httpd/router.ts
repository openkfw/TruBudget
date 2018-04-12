import * as express from "express";

import { authorized } from "../authz";
import ProjectModel from "../project";
import UserModel from "../user";
import { MultichainClient } from "../multichain";

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

const send = (res, code: number, response: Response) => {
  res.status(code).json(response);
};

const apiVersion = "1.0";
export const createRouter = (
  multichainClient: MultichainClient,
  jwtSecret: string,
  rootSecret: string
) => {
  const userModel = new UserModel(multichainClient, jwtSecret, rootSecret);
  const projectModel = new ProjectModel(multichainClient);

  const router = express.Router();

  router.get("/health", (req, res) => res.status(200).send("OK"));

  router.post("/user.create", async (req, res) => {
    const intent = req.path.substring(1);
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
      const response = {
        apiVersion: apiVersion,
        data: await userModel.create(body.data, authorized(req.token, intent))
      };
      send(res, 201, response);
    } catch (err) {
      switch (err.kind) {
        case "NotAuthorized":
          console.log(err);
          send(res, 403, {
            apiVersion: req.body.apiVersion,
            error: {
              code: 403,
              message: `User ${req.token.userId} is not authorized to execute ${intent}`
            }
          });
          break;
        case "UserAlreadyExists":
          console.log(err);
          send(res, 409, {
            apiVersion: req.body.apiVersion,
            error: { code: 409, message: `The user already exists.` }
          });
          break;
        case "ParseError":
          console.log(err);
          send(res, 400, {
            apiVersion: req.body.apiVersion,
            error: { code: 400, message: `Missing keys: ${err.badKeys.join(", ")}` }
          });
          break;
        default:
          console.log(err);
          send(res, 500, {
            apiVersion: req.body.apiVersion,
            error: { code: 500, message: "INTERNAL SERVER ERROR" }
          });
      }
    }
  });
  router.get("/user.list", async (req, res) => {
    const intent = req.path.substring(1);

    const response = {
      apiVersion: "1.0",
      data: await userModel.list(authorized(req.token, "user.view"))
    };
    send(res, 200, response);
  });

  router.post("/user.authenticate", async (req, res) => {
    const intent = req.path.substring(1);
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
        data: await userModel.authenticate(body.data)
      };
      console.log(response);
      send(res, 200, response);
    } catch (err) {
      switch (err.kind) {
        case "ParseError":
          console.log(err);
          send(res, 400, {
            apiVersion: body.apiVersion,
            error: { code: 400, message: `Missing keys: ${err.badKeys.join(", ")}` }
          });
          break;
        case "AuthenticationError":
          console.log(err);
          send(res, 401, {
            apiVersion: body.apiVersion,
            error: { code: 401, message: "Authentication failed" }
          });
          break;
        default:
          console.log(err);
          send(res, 500, {
            apiVersion: body.apiVersion,
            error: { code: 500, message: "INTERNAL SERVER ERROR" }
          });
      }
    }
  });

  router.get("/project.list", async (req, res) => {
    // Returns all projects the user is allowed to see
    try {
      const projects = await projectModel.list(authorized(req.token, "project.viewSummary"));
      res.json({
        apiVersion: apiVersion,
        data: {
          items: projects
        }
      });
    } catch (err) {
      console.log(err);
      send(res, 500, {
        apiVersion: req.body.apiVersion,
        error: { code: 500, message: "INTERNAL SERVER ERROR" }
      });
    }
  });
  router.get("/project.viewDetails/:projectId", async (req, res) => {
    const intent = req.path.split("/")[1];
    try {
      const { projectId } = req.params;
      const project = await projectModel.details(projectId, authorized(req.token, intent));
      const response = {
        apiVersion: apiVersion,
        data: {
          ...project
        }
      };
      send(res, 200, response);
    } catch (err) {
      console.log(err);
    }
  });

  router.post("/project.create", async (req, res) => {
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
        req.token.userId,
        body.data,
        authorized(req.token, intent)
      );
      const response = {
        apiVersion: apiVersion,
        data: id
      };
      send(res, 201, response);
    } catch (err) {
      if (err.kind === "NotAuthorized") {
        console.log(err);
        res.status(403).send({
          apiVersion: body.apiVersion,
          error: {
            code: 403,
            message: `User ${req.token.userId} is not authorized to execute ${intent}`
          }
        });
      } else {
        console.log(err);
        send(res, 500, {
          apiVersion: body.apiVersion,
          error: { code: 500, message: "INTERNAL SERVER ERROR" }
        });
      }
    }
  });

  return router;
};
