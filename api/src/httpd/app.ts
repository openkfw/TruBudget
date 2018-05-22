import * as bodyParser from "body-parser";
import * as express from "express";
import * as expressJwt from "express-jwt";
import { AuthToken } from "../authz/token";

const addTokenHandling = (app, jwtSecret: string) => {
  app.use(
    expressJwt({ secret: jwtSecret }).unless({
      path: ["/liveness", "/readiness", "/user.authenticate"],
    }),
  );
  app.use(function customAuthTokenErrorHandler(err, req, res, next) {
    console.log(err);
    if (err.name === "UnauthorizedError") {
      res.status(401).send({
        apiVersion: req.body.apiVersion,
        error: { code: 401, message: "A valid JWT auth bearer token is required for this route." },
      });
    }
  });
  app.use(function aliasToken(req, res, next) {
    req.token = req.user;
    next();
  });
};

const logging = (req: express.Request, res, next) => {
  switch (req.path) {
    case "/liveness":
    case "/readiness":
      break;
    default: {
      const details = [
        (req as any).token !== undefined
          ? `user=${((req as any).token as AuthToken).userId}`
          : null,
        Object.keys(req.query).length !== 0 ? `query=${JSON.stringify(req.query)}` : null,
        Object.keys(req.body).length !== 0 ? `body=${JSON.stringify(req.body)}` : null,
      ].filter(x => x !== null);
      console.log(`\n${req.method} ${req.path} [${details.join(" ")}]`);
    }
  }
  next();
};

export const createBasicApp = (jwtSecret: string, rootSecret: string) => {
  const app = express();
  app.use(bodyParser.json());
  addTokenHandling(app, jwtSecret);
  app.use(logging);
  return app;
};
