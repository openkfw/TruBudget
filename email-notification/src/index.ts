import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import config from "./config";
import DbConnector from "./db";
import logger from "./logger";
import sendMail from "./sendMail";

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

const db = new DbConnector();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/readiness", (_req: express.Request, res: express.Response) => {
  res.send(true);
});

app.post("/user.insert", (req: UserEditRequest, res: express.Response) => {
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
  const id: string = req.body.data.user.id;
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
