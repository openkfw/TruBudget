import bodyParser from "body-parser";
import * as child from "child_process";
import cors from "cors";
import express from "express";
import config from "./config";
import DbConnector from "./db";

const db = new DbConnector();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Start TCP Server for notification hook of blockchain
const tcpproc = child.spawn("node", ["./dist/tcpCommandListener.js"]);
tcpproc.stdout.on("data", data => {
  console.log(`TCP Command Listener: ${data}`);
});
tcpproc.stderr.on("data", data => {
  console.log(`TCP Command Listener: Error: ${data}`);
});
tcpproc.on("close", () => console.log(`TCP Command Listener stopped`));

// Start HTTP Server for insert/delete User in database
app.get("/readiness", (req, res) => {
  res.send(true);
});

app.post("/user.insert", (req, res) => {
  const user = req.body.data.user;
  (async () => {
    console.log(req.body);
    const email = await db.getEmail(user.id);
    if (email.length > 0) {
      await db.updateUser(user.id, user.email);
    } else {
      await db.insertUser(user.id, user.email);
    }
  })().catch(error => console.log("Error:", error));
  res.send(`User ${user.id} inserted`);
});

app.get("/user.getEmail", (req, res) => {
  const id = req.query.id;
  (async () => {
    res.send(await db.getEmail(id));
  })().catch(error => console.log("Error:", error));
});

app.post("/user.delete", (req, res) => {
  const user = req.body.data.user;
  (async () => {
    await db.deleteUser(user.id, user.email);
  })().catch(error => () => {
    console.log("Error:", error);
    res.send(error);
  });
  res.send(`User ${user.id} deleted`);
});

app.listen(config.http.port, () => {
  console.log(`App listening on ${config.http.port}`);
});
