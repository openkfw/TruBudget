import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import config from "./config";
import DbConnector from "./db";
import logger from "./logger";
import * as Middleware from "./middleware";
import sendMail from "./sendMail";

// TODO: Validate requests with joi

interface User {
  id: string;
  email: string;
}

interface Request {
  body: {
    data: any;
  };
}

type Status = "updated" | "inserted" | "deleted" | "sent";

interface UserEditResponseBody {
  user: {
    id: string;
    status: Status;
    email: string;
  };
}
interface UserGetEmailResponseBody {
  user: User;
}

interface UserEditRequest {
  body: {
    data: {
      user: User;
    };
  };
}
interface NotificationRequest {
  body: {
    data: {
      user: {
        id: string;
      };
    };
  };
}
interface NotificationResponseBody {
  notification: {
    recipient: string;
    email: string;
    status: Status;
  };
}
interface UserGetEmailRequest {
  query: {
    id: string;
  };
}

// Setup
const db = new DbConnector();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// JWT secret
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
app.all("/user*", (req, res, next) => Middleware.verifyUserJWT(req, res, next, jwtSecret));
app.all("/notification*", (req, res, next) =>
  Middleware.verifyNotificationJWT(req, res, next, jwtSecret),
);

// Routes
app.get("/readiness", (_req: express.Request, res: express.Response) => {
  res.send(true);
});

app.post("/user.insert", (req: UserEditRequest, res: express.Response) => {
  // Only email of requestor can be deleted
  const userToInsert: User = req.body.data.user;
  const requestor: string = res.locals.userId;
  if (requestor !== userToInsert.id && requestor !== "root") {
    res.status(401).send({
      message: `${res.locals.userId} is not allowed to insert an email of user ${req.body.data.user}`,
    });
  }

  const user: User = req.body.data.user;
  (async () => {
    const email: string = await db.getEmail(user.id);
    let body: UserEditResponseBody;
    if (email.length > 0) {
      body = { user: { id: user.id, status: "updated", email: user.email } };
      await db.updateUser(user.id, user.email);
    } else {
      await db.insertUser(user.id, user.email);
      body = {
        user: { id: user.id, status: "inserted", email: user.email },
      };
    }
    res.status(200).send(body);
  })().catch(error => {
    logger.error(error);
    res.status(500).send(error);
  });
});

app.get("/user.getEmail", (req: UserGetEmailRequest, res: express.Response) => {
  // Only email of requestor can be checked
  const requestedUserId: string = req.query.id;
  const requestor: string = res.locals.userId;
  if (requestor !== requestedUserId && requestor !== "root") {
    res.status(401).send({
      message: `${res.locals.userId} is not allowed to insert an email of user ${req.query.id}`,
    });
  }

  const id: string = req.query.id;
  (async () => {
    const body: UserGetEmailResponseBody = { user: { id, email: await db.getEmail(id) } };
    res.send(body);
  })().catch(error => {
    logger.error(error);
    res.status(500).send(error);
  });
});

app.post("/user.delete", (req: UserEditRequest, res: express.Response) => {
  // Only email of requestor can be deleted
  const userToInsert: User = req.body.data.user;
  const requestor: string = res.locals.userId;
  if (requestor !== userToInsert.id && requestor !== "root") {
    res.status(401).send({
      message: `${res.locals.userId} is not allowed to insert an email of user ${req.body.data.user}`,
    });
  }

  const user: User = req.body.data.user;
  (async () => {
    await db.deleteUser(user.id, user.email);
    const body: UserEditResponseBody = {
      user: { id: user.id, status: "deleted", email: user.email },
    };
    res.status(200).send(body);
  })().catch(error => () => {
    logger.error(error);
    res.status(500).send(error);
  });
});

app.post("/notification.send", (req: NotificationRequest, res: express.Response) => {
  // Only the notification watcher of the Trubudget blockchain may send notifications
  const id: string = req.body.data.user.id;
  if (res.locals.id !== "notification-watcher") {
    res.status(401).send({
      message: `${res.locals.id} is not allowed to send a notification to ${id}`,
    });
  }
  let email: string;
  (async () => {
    email = await db.getEmail(id);
    let body: NotificationResponseBody;
    if (email.length > 0) {
      await sendMail(email);
      logger.debug("Notification sent to " + email);
      body = {
        notification: { recipient: id, status: "sent", email },
      };
      res.status(200).send(body);
    } else {
      logger.debug("Email " + email + "not found");
      body = { notification: { recipient: id, status: "deleted", email: "Not Found" } };
      res.status(404).send(body);
    }
  })().catch(error => () => {
    logger.error(error);
    res.status(500).send(error);
  });
});

app.listen(config.http.port, () => {
  logger.info(`App listening on ${config.http.port}`);
});
