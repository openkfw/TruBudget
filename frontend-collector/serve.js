require("dotenv").config();
const {
  LOGGER_PORT,
  LOG_LEVEL,
  LOGGING_SERVICE_CACHE_DURATION,
} = process.env;
if (!LOGGER_PORT || !LOGGING_SERVICE_CACHE_DURATION) {
  console.log("Please provide all requierd ENV variables!");
  return;
}

const logger = require("trubudget-logging-service").createPinoLogger("Trubudget-Frontend");
const fastify = require("fastify")({
  logger: LOG_LEVEL === "trace" ? logger : undefined,
});

const toStdOut = (logMsg) => {
  logMsg.logMessages.forEach((e) => {
    switch (e.what) {
      case "Error":
        logger.error(JSON.stringify(e));
        break;
      case "Trace":
        logger.trace(JSON.stringify(e));
        break;
      default:
        logger.info(JSON.stringify(e));
        break;
    }
  });
};

fastify.register(require("@fastify/cors"), {
  origin: "*",
});

fastify.post("/api", (request, reply) => {
  try {
    console.log(request.headers);

    toStdOut(request.body);

    reply.status(200).send({
      status: "ok",
    });
  } catch (e) {
    logger.error({ err: e }, "Could not handle incoming request!");
    reply.status(500).send("Ups ...");
  }
});

fastify.get("/alive", (_request, reply) => {
  reply.status(200).send({
    alive: "true",
  });
});

fastify.get('/', function (_request, reply) {
  reply
    .code(200)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send({ hello: 'world' })
})

fastify.listen({ port: Number(LOGGER_PORT || 3001), host: "0.0.0.0" }, (err) => {
  if (err) {
    logger.fatal({ err }, "Error on binding fastify to IPv4 address");
    process.exit(1);
  }
});
 