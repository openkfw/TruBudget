import * as express from "express";
import * as bodyParser from "body-parser";
import * as expressJwt from "express-jwt";

const addTokenHandling = (app, jwtSecret: string) => {
  app.use(
    expressJwt({ secret: jwtSecret }).unless({
      path: ["/health", "/user.authenticate"]
    })
  );
  app.use(function customAuthTokenErrorHandler(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
      res.status(401).send({
        apiVersion: req.body.apiVersion,
        error: { code: 401, message: "A valid JWT auth bearer token is required for this route." }
      });
    }
  });
  app.use(function aliasToken(req, res, next) {
    req.token = req.user;
    next();
  });
};

export const createBasicApp = (jwtSecret: string, rootSecret: string) => {
  const app = express();
  app.use(bodyParser.json());
  addTokenHandling(app, jwtSecret);
  return app;
};
