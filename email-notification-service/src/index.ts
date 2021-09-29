import express from "express";
import cors from "cors";
import { body, query } from "express-validator";
import { createPinoExpressLogger } from "trubudget-logging-service";
import config from "./config";
import DbConnector from "./db";
import * as Middleware from "./middleware";
import sendMail from "./sendMail";
import {
  UserEditRequest,
  User,
  UserEditResponseBody,
  UserGetEmailAddressRequest,
  NotificationRequest,
  NotificationResponseBody,
} from "./types";
import isBodyValid from "./validation";
import logger from "./logger";

// Setup
const db = new DbConnector();
const emailService = express();
emailService.use(createPinoExpressLogger(logger));
emailService.use(express.json());
emailService.use(cors({ origin: config.allowOrigin }));

// JWT secret
if (config.authentication === "jwt") {
  configureJWT();
} else {
  logger.info("No authentication method configured");
}

// Routes
emailService.get("/readiness", (_req: express.Request, res: express.Response) => {
  res.send(true);
});

emailService.get("/version", (_req: express.Request, res: express.Response) => {
  res.status(200).send({
    release: process.env.npm_package_version,
    commit: process.env.CI_COMMIT_SHA || "",
    buildTimeStamp: process.env.BUILDTIMESTAMP || "",
  });
});

emailService.post(
  "/user.insert",
  body("data.user.id").escape(),
  (req: UserEditRequest, res: express.Response) => {
    const isDataValid = isBodyValid("/user.insert", req.body.data);
    if (!isDataValid) {
      res.status(400).send({
        message: `The request body validation failed`,
      });
      return;
    }
    const user: User = req.body.data.user;
    if (!isAllowed(user.id, res)) {
      res.status(401).send({
        message: `JWT-Token is not valid to insert an email address of user ${user.id}`,
      });
      return;
    }

    (async () => {
      const emailAddress: string = await db.getEmailAddress(user.id);
      if (emailAddress.length > 0) {
        res.status(400).send({
          user: { id: user.id, status: "already exists", emailAddress: user.emailAddress },
        });
      } else {
        await db.insertUser(user.id, user.emailAddress);
        res.status(200).send({
          user: { id: user.id, status: "inserted", emailAddress: user.emailAddress },
        });
      }
    })().catch((error) => {
      logger.error(error);
      res.status(500).send(error);
    });
  },
);

emailService.post(
  "/user.update",
  body("data.user.id").escape(),
  (req: UserEditRequest, res: express.Response) => {
    const isDataValid = isBodyValid("/user.update", req.body.data);
    if (!isDataValid) {
      res.status(400).send({
        message: `The request body validation failed`,
      });
      return;
    }
    const user: User = req.body.data.user;
    if (!isAllowed(user.id, res)) {
      res.status(401).send({
        message: `JWT-Token is not valid to insert an email address of user ${user.id}`,
      });
      return;
    }

    (async () => {
      const emailAddress: string = await db.getEmailAddress(user.id);
      let body: UserEditResponseBody;
      if (emailAddress.length > 0) {
        body = { user: { id: user.id, status: "updated", emailAddress: user.emailAddress } };
        await db.updateUser(user.id, user.emailAddress);
        res.status(200);
      } else {
        body = {
          user: { id: user.id, emailAddress: user.emailAddress, status: "not found" },
        };
        res.status(404);
      }
      res.send(body);
    })().catch((error) => {
      logger.error(error);
      res.status(500).send(error);
    });
  },
);

emailService.post(
  "/user.delete",
  body("data.user.id").escape(),
  (req: UserEditRequest, res: express.Response) => {
    const isDataValid = isBodyValid("/user.delete", req.body.data);
    if (!isDataValid) {
      res.status(400).send({
        message: `The request body validation failed`,
      });
      return;
    }
    const user: User = req.body.data.user;
    if (!isAllowed(user.id, res)) {
      res.status(401).send({
        message: `JWT-Token is not valid to insert an email address of user ${user.id}`,
      });
      return;
    }

    (async () => {
      await db.deleteUser(user.id, user.emailAddress);
      const body: UserEditResponseBody = {
        user: { id: user.id, status: "deleted", emailAddress: user.emailAddress },
      };
      res.status(200).send(body);
    })().catch((error) => {
      logger.error(error);
      res.status(500).send(error);
    });
  },
);

emailService.get(
  "/user.getEmailAddress",
  query("id").escape(),
  (req: UserGetEmailAddressRequest, res: express.Response) => {
    const isDataValid = isBodyValid("/user.getEmailAddress", req.query);
    if (!isDataValid) {
      res.status(400).send({
        message: `The request body validation failed`,
      });
      return;
    }
    if (!isAllowed(req.query.id, res)) {
      res.status(401).send({
        message: `JWT-Token is not valid to insert an email address of user ${req.query.id}`,
      });
      return;
    }

    const id: string = req.query.id;
    (async () => {
      const emailAddress = await db.getEmailAddress(id);
      if (emailAddress.length > 0) {
        logger.debug("GET email address " + emailAddress + " for user " + id);
        res.send({
          user: { id, emailAddress },
        });
      } else {
        logger.debug("Email address" + emailAddress + " not found");
        res.status(404).send({
          user: { id, emailAddress: "Not Found" },
        });
      }
    })().catch((error) => {
      logger.error(error);
      res.status(500).send(error);
    });
  },
);

emailService.post(
  "/notification.send",
  body("data.user.id").escape(),
  (req: NotificationRequest, res: express.Response) => {
    const isDataValid = isBodyValid("/notification.send", req.body.data);
    if (!isDataValid) {
      res.status(400).send({
        message: `The request body validation failed`,
      });
      return;
    }
    const id: string = req.body.data.user.id;
    // authenticate
    if (config.authentication !== "none") {
      // Only the notification watcher of the Trubudget blockchain may send notifications
      if (res.locals.id !== "notification-watcher") {
        res.status(401).send({
          message: `${res.locals.id} is not allowed to send a notification to ${id}`,
        });
        return;
      }
    }

    let emailAddress: string;
    (async () => {
      emailAddress = await db.getEmailAddress(id);
      let body: NotificationResponseBody;
      if (emailAddress.length > 0) {
        await sendMail(emailAddress);
        logger.debug("Notification sent to " + emailAddress);
        body = {
          notification: { recipient: id, status: "sent", emailAddress },
        };
        res.status(200).send(body);
      } else {
        logger.debug("Email address" + emailAddress + "not found");
        body = { notification: { recipient: id, status: "deleted", emailAddress: "Not Found" } };
        res.status(404).send(body);
      }
    })().catch((error) => () => {
      logger.error(error);
      res.status(500).send(error);
    });
  },
);

emailService.listen(config.http.port, () => {
  logger.info(`App listening on ${config.http.port}`);
});

function isAllowed(requestedUserId: string, res: express.Response): boolean {
  if (config.authentication === "none") {
    return true;
  }
  const requestor: string = res.locals.userId;
  const allowed: boolean = requestor === "root" || requestor === requestedUserId;
  if (!allowed) {
    logger.debug(
      "Requestor '" + requestor + "' and passed userId '" + requestedUserId + "' are not equal",
    );
  }
  return allowed;
}

function configureJWT() {
  logger.info("Configure with JWT authentication ...");
  if (!process.env.JWT_SECRET) {
    logger.error(
      "The 'JWT_SECRET' env variable is not set. Without the JWT secret of the token providing Trubudget API the server cannot identify the user.",
    );
    process.exit();
  }
  const jwtSecret: string = process.env.JWT_SECRET;
  if (jwtSecret.length < 32) {
    logger.warn("The JWT secret key should be at least 32 characters long.");
  }
  // Add middlewares
  emailService.all("/user*", (req, res, next) =>
    Middleware.verifyUserJWT(req, res, next, jwtSecret),
  );
  emailService.all("/notification*", (req, res, next) =>
    Middleware.verifyNotificationJWT(req, res, next, jwtSecret),
  );
}
