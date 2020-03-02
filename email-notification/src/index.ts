import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import config from "./config";
import DbConnector from "./db";
import logger from "./logger";
import sendMail from "./sendMail";

const db = new DbConnector();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/readiness", (_req, res) => {
  res.send(true);
});

app.post("/user.insert", (req, res) => {
  const user = req.body.data.user;
  (async () => {
    const email = await db.getEmail(user.id);
    if (email.length > 0) {
      await db.updateUser(user.id, user.email);
      res.status(200).send({ user: { id: user.id, status: "updated", email: user.email } });
    } else {
      await db.insertUser(user.id, user.email);
      res.status(200).send({ user: { id: user.id, status: "inserted", email: user.email } });
    }
  })().catch(error => {
    logger.error(error);
    res.status(500).send(error);
  });
});

app.get("/user.getEmail", (req, res) => {
  const id = req.query.id;
  (async () => {
    res.send({ user: { id, email: await db.getEmail(id) } });
  })().catch(error => {
    logger.error(error);
    res.status(500).send(error);
  });
});

app.post("/user.delete", (req, res) => {
  const user = req.body.data.user;
  (async () => {
    await db.deleteUser(user.id, user.email);
    res.status(200).send({ user: { id: user.id, status: "deleted", email: user.email } });
  })().catch(error => () => {
    logger.error(error);
    res.status(500).send(error);
  });
});

app.post("/notification.send", (req, res) => {
  const id = req.body.data.user.id;
  let email;
  (async () => {
    email = await db.getEmail(id);
    if (email.length > 0) {
      await sendMail(email);
      logger.debug("Notification sent to " + email);
      res.status(200).send({ notification: { recipient: id, status: "sent", email } });
    } else {
      logger.debug("Email " + email + "not found");
      res.status(404).send({ notification: { recipient: id, email: "Not Found" } });
    }
  })().catch(error => () => {
    logger.error(error);
    res.status(500).send(error);
  });
});

app.listen(config.http.port, () => {
  logger.info(`App listening on ${config.http.port}`);
});
