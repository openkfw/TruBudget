import cors from "cors";
import express from "express";
import { body, query } from "express-validator";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { createPinoExpressLogger } from "trubudget-logging-service";
import helmet from "helmet";
import config from "./config";
import DbConnector from "./db";
import logger from "./logger";
import * as Middleware from "./middleware";
import sendMail from "./sendMail";
import {
  NotificationRequest,
  NotificationResponseBody,
  ResetPasswordRequest,
  User,
  UserEditRequest,
  UserEditResponseBody,
  UserGetEmailAddressByEmailRequest,
  UserGetEmailAddressRequest,
} from "./types";
import isBodyValid from "./validation";

if (config.email.from === undefined) {
  logger.warn(
    "The 'EMAIL_FROM' env variable is not set. The email service will not be able to send emails.",
  );
}

// Setup
let corsOptions = {
  credentials: true,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  origin: function (origin: any, callback: any) {
    if (config.allowOrigin === "*") {
      callback(null, true);
    } else if (config.allowOrigin.split(";").includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
const db = new DbConnector();
const emailService = express();
emailService.use(createPinoExpressLogger(logger));
emailService.use(express.json());
emailService.use(cors(corsOptions));
emailService.use(cookieParser());
emailService.use(helmet());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit || 100, // limit each IP to 100 requests per windowMs
});

// JWT secret
if (config.authentication === "jwt") {
  configureJWT();
} else {
  logger.info("No authentication method configured");
}

if (config.rateLimit) {
  emailService.use(limiter);
}

// Routes
emailService.get("/liveness", (req, res) => {
  res
    .status(200)
    .header({ "Content-Type": "application/json" })
    .send(
      JSON.stringify({
        uptime: process.uptime(),
      }),
    );
});

emailService.get("/readiness", async (_req: express.Request, res: express.Response) => {
  const { status, statusText } = await db.liveness();

  res.status(status).header({ "Content-Type": "application/json" }).send(statusText);
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
    logger.trace("Validating data");

    const isDataValid = isBodyValid("/user.insert", req.body.data);
    if (!isDataValid) {
      logger.error("Validation error. Data not valid!");
      res.status(400).send({
        message: "The request body validation failed",
      });
      return;
    }
    const user: User = req.body.data.user;
    if (!isAllowed(user.id, res)) {
      const message = `JWT-Token is not valid to insert an email address of user ${user.id}`;
      logger.error(message);
      res.status(401).send({
        message,
      });
      return;
    }

    (async (): Promise<void> => {
      logger.trace({ user }, "Fetching email address for user");
      const emailAddress: string = await db.getEmailAddress(user.id);
      if (emailAddress.length > 0) {
        logger.error({ user }, "User already exists");
        res.status(400).send({
          user: { id: user.id, status: "already exists", emailAddress: user.emailAddress },
        });
      } else {
        logger.trace("Inserted user");
        await db.insertUser(user.id, user.emailAddress);
        res.status(200).send({
          user: { id: user.id, status: "inserted", emailAddress: user.emailAddress },
        });
      }
    })().catch((error) => {
      logger.error({ err: error }, "Error while inserting user");
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
      logger.error("Validation error. Data not valid!");
      res.status(400).send({
        message: "The request body validation failed",
      });
      return;
    }
    const user: User = req.body.data.user;
    if (!isAllowed(user.id, res)) {
      const message = `JWT-Token is not valid to insert an email address of user ${user.id}`;
      logger.error(message);
      res.status(401).send({
        message,
      });
      return;
    }

    (async (): Promise<void> => {
      const emailAddress: string = await db.getEmailAddress(user.id);
      logger.trace("Fetching email address for user: ", user.id);
      let body: UserEditResponseBody;
      if (emailAddress.length > 0) {
        body = { user: { id: user.id, status: "updated", emailAddress: user.emailAddress } };
        logger.trace("Updateing user ", user.id, user.emailAddress);
        await db.updateUser(user.id, user.emailAddress);
        res.status(200);
      } else {
        body = {
          user: { id: user.id, emailAddress: user.emailAddress, status: "not found" },
        };
        logger.error({ error: body }, "User not found");
        res.status(404);
      }
      res.send(body);
    })().catch((error) => {
      logger.error({ err: error }, "Error while updating user");
      res.status(500).send(error);
    });
  },
);

emailService.post(
  "/user.delete",
  body("data.user.id").escape(),
  (req: UserEditRequest, res: express.Response) => {
    const isDataValid = isBodyValid("/user.delete", req.body.data);
    logger.trace("Validating data");

    if (!isDataValid) {
      logger.error("Validation error. Data not valid!");
      res.status(400).send({
        message: "The request body validation failed",
      });
      return;
    }
    const user: User = req.body.data.user;
    if (!isAllowed(user.id, res)) {
      logger.error(`JWT-Token is not valid to insert an email address of user ${user.id}`);
      res.status(401).send({
        message: `JWT-Token is not valid to insert an email address of user ${user.id}`,
      });
      return;
    }

    (async (): Promise<void> => {
      await db.deleteUser(user.id, user.emailAddress);
      const body: UserEditResponseBody = {
        user: { id: user.id, status: "deleted", emailAddress: user.emailAddress },
      };
      logger.trace("Deleted user", user.id, user.emailAddress);
      res.status(200).send(body);
    })().catch((error) => {
      logger.error({ err: error }, "Error while deleting user");
      res.status(500).send(error);
    });
  },
);

emailService.get(
  "/user.getEmailAddress",
  query("id").escape(),
  (req: UserGetEmailAddressRequest, res: express.Response) => {
    const isDataValid = isBodyValid("/user.getEmailAddress", req.query);
    logger.trace("Validating data");

    if (!isDataValid) {
      logger.error("Validation error. Data not valid!");
      res.status(400).send({
        message: "The request body validation failed",
      });
      return;
    }
    if (!isAllowed(req.query.id, res)) {
      const message = `JWT-Token is not valid to insert an email address of user ${req.query.id}`;
      logger.error(message);
      res.status(401).send({
        message,
      });
      return;
    }

    const id: string = req.query.id;
    (async (): Promise<void> => {
      const emailAddress = await db.getEmailAddress(id);
      if (emailAddress.length > 0) {
        logger.trace("GET email address " + emailAddress + " for user " + id);
        res.send({
          user: { id, emailAddress },
        });
      } else {
        logger.info("Email address" + emailAddress + " not found");
        res.status(404).send({
          user: { id, emailAddress: "Not Found" },
        });
      }
    })().catch((error) => {
      logger.error({ err: error }, "Error while getting email adress");
      res.status(500).send(error);
    });
  },
);

emailService.get(
  "/user.getEmailAddressByEmail",
  query("email").escape(),
  (req: UserGetEmailAddressByEmailRequest, res: express.Response) => {
    const isDataValid = isBodyValid("/user.getEmailAddressByEmail", req.query);
    logger.trace("Validating data");

    if (!isDataValid) {
      logger.error("Validation error. Data not valid!");
      res.status(400).send({
        message: "The request body validation failed",
      });
      return;
    }
    if (!isAllowed(req.query.email, res)) {
      const message = `JWT-Token is not valid to insert an email address of user ${req.query.email}`;
      logger.error(message);
      res.status(401).send({
        message,
      });
      return;
    }

    const email: string = req.query.email;
    (async (): Promise<void> => {
      const user = await db.getEmailAddressAndUserId(email);
      if (user) {
        logger.trace("GET email address " + user.email + " for user " + user.id);
        res.send({
          user,
        });
      } else {
        logger.info("Email address" + email + " not found");
        res.status(404).send(null);
      }
    })().catch((error) => {
      logger.error({ err: error }, "Error while getting email address");
      res.status(500).send(error);
    });
  },
);

emailService.post(
  "/notification.send",
  body("data.user.id").escape(),
  (req: NotificationRequest, res: express.Response) => {
    logger.trace("Validating data");
    const isDataValid = isBodyValid("/notification.send", req.body.data);
    if (!isDataValid) {
      logger.error("Validation error. Data not valid!");
      res.status(400).send({
        message: "The request body validation failed",
      });
      return;
    }
    const id: string = req.body.data.user.id;
    // authenticate
    if (config.authentication === "jwt") {
      // Only the notification watcher of the Trubudget blockchain may send notifications
      if (res.locals.id !== "notification-watcher") {
        const message = `${res.locals.id} is not allowed to send a notification to ${id}`;
        logger.error(message);
        res.status(401).send({
          message,
        });
        return;
      }
    }

    let emailAddress: string;
    (async (): Promise<void> => {
      try {
        logger.info(`Get email address of user ${id}`);
        emailAddress = await db.getEmailAddress(id);
        let body: NotificationResponseBody;
        if (emailAddress.length > 0) {
          await sendMail(emailAddress);
          logger.trace("Notification sent to " + emailAddress);
          body = {
            notification: { recipient: id, status: "sent", emailAddress },
          };
          res.status(200).send(body);
        } else {
          logger.trace("Email address" + emailAddress + "not found");
          body = { notification: { recipient: id, status: "deleted", emailAddress: "Not Found" } };
          res.status(404).send(body);
        }
      } catch (error) {
        logger.error(`Error while send notification: ${error}`);
        res.status(500).send(error);
      }
    })();
  },
);

emailService.post(
  "/resetPassword",
  body("data.user.*").escape(),
  (req: ResetPasswordRequest, res: express.Response) => {
    logger.trace("Validating data");
    const isDataValid = isBodyValid("/resetPassword", req.body.data);
    if (!isDataValid) {
      logger.error("Validation error. Data not valid!");
      res.status(400).send({
        message: "The request body validation failed",
      });
      return;
    }
    logger.info(req.body);
    const { id, email, emailText } = req.body.data.user;
    // authenticate
    if (config.authentication === "jwt") {
      // Only the notification watcher of the Trubudget blockchain may send notifications
      if (res.locals.id !== "notification-watcher") {
        const message = `${res.locals.id} is not allowed to send a notification to ${id}`;
        logger.error(message);
        res.status(401).send({
          message,
        });
        return;
      }
    }

    (async (): Promise<void> => {
      try {
        await sendMail(email, "Trubudget password reset", emailText);
        logger.trace("Notification sent to " + email);
        const body: NotificationResponseBody = {
          notification: { recipient: id, status: "sent", emailAddress: email },
        };
        res.status(200).send(body);
      } catch (error) {
        logger.error(`Error while send notification: ${error}`);
        res.status(500).send(error);
      }
    })();
  },
);

emailService.listen(config.http.port, () => {
  logger.info(`App listening on ${config.http.port}`);
});

function isAllowed(requestedUserId: string, res: express.Response): boolean {
  if (config.authentication !== "jwt") {
    return true;
  }
  const requestor: string = res.locals.userId;
  const allowed: boolean = requestor === "root" || requestor === requestedUserId;

  logger.debug({ requestor, allowed }, "Checking if requestor is allowed");

  return allowed;
}

function configureJWT(): void {
  logger.info("Configure with JWT authentication ...");

  if (config.jwt.algorithm === "HS256" && !config.jwt.secretOrPrivateKey) {
    logger.error(
      "The 'JWT_SECRET' env variable is not set. Without the JWT secret of the token providing Trubudget API the server cannot identify the user.",
    );
    process.exit();
  }
  if (config.jwt.algorithm === "RS256" && !config.jwt.publicKey) {
    logger.error(
      "JWT algorithm is set to RS256, but no public key in'JWT_PUBLIC_KEY' is provided.",
    );
    process.exit();
  }

  if (config.jwt.algorithm === "HS256" && config.jwt.secretOrPrivateKey.length < 32) {
    logger.warn("JWT_SECRET should be at least 32 characters long.");
  }

  // Add middlewares
  emailService.all("/user*", (req, res, next) => Middleware.verifyUserJWT(req, res, next));
  emailService.all("/notification*", (req, res, next) =>
    Middleware.verifyNotificationJWT(req, res, next),
  );
}
