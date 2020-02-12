import { createServer } from "net";
import config from "./config";
import DbConnector from "./db";
import sendMail from "./sendMail";

const db = new DbConnector();

const server = createServer(socket => {
  socket.on("data", dataBuffer => {
    const data = JSON.parse(dataBuffer.toString());
    switch (data.Command) {
      case "sendNotification":
        // verifyData(data);
        (async () => {
          const email = await db.getEmail(data.ID);
          if (email.length > 0) {
            await sendMail(email);
          }
        })().catch(error => console.log("Error:", error));
        break;
      default:
        console.log("unknown action");
        break;
    }
  });
  socket.end(() => {
    console.log("client disconnected!");
  });
});

console.log(`Starting TruBudget Email service on ${config.tcp.port}`);

server.listen(config.tcp.port);
