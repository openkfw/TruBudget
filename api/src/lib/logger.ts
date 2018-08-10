import * as pino from "pino";

const logger = pino({
  name: "TruBudget",
  safe: true,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  level: "trace",
  prettyPrint: process.env.NODE_ENV !== "production",
  // redact: ["password"],
});

export default logger;
