import * as pino from "pino";
import

const logger = pino({
  name: "TruBudget",
  base: {pid: process.pid, hostname: os.hostname},
  safe: true,
  level: "debug",
  crlf: false,
  prettyPrint: false, //process.env.NODE_ENV !== "production",
});

export default logger;
