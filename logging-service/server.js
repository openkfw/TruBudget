const {
  API_HOST,
  API_PORT,
  LOGGER_PORT,
  LOG_LEVEL,
  LOGGING_SERVICE_CACHE_DURATION,
} = process.env;
if (!API_HOST || !API_PORT || !LOGGER_PORT || !LOGGING_SERVICE_CACHE_DURATION) {
  console.log("Please provide all required ENV variables!");
  return;
}
const logBuilder = require("trubudget-pino-logger");
const axios = require("axios");
const jwtCache = new Set();
const logger = logBuilder.createPinoLogger("Trubudget-Frontend");
const fastify = require("fastify")({
  logger: LOG_LEVEL === "trace" ? logger : undefined,
});

setInterval(() => {
  logger.info("Clearing JWT Cache");
  jwtCache.clear();
}, 60 * LOGGING_SERVICE_CACHE_DURATION * 1000);

fastify.listen(LOGGER_PORT, "0.0.0.0", function (err, address) {
  if (err) {
    logger.fatal({ err }, "Error on binding fastify to IPv4 address");
    process.exit(1);
  }
  logger.info(`server listening on ${address}`);
});

fastify.register(require("fastify-cors"), {
  // set CORS env var
  origin: "*",
});

fastify.post("/api", async (request, reply) => {
  try {
    if (
      (request.headers.authorization !== "" ||
        request.headers.authorization !== undefined) &&
      request.headers.authorization.includes("Bearer")
    ) {
      const tokenToValidate = request.headers.authorization;
      const isValidToken = await verifyJWTToken(tokenToValidate);
      if (!isValidToken)
        reply.status(401).send("Please provide a valid authorization token");
    } else {
      reply.status(401).send("Please provide authorization token");
    }
    toStdOut(request.body);

    reply.status(200).send({
      status: "ok",
    });
  } catch (e) {
    logger.error({ err: e }, "Could not handle incoming request!");
    reply.status(500).send("Internal Server Error");
  }
});

fastify.get("/alive", (req, res) => {
  return res.status(200).send({
    alive: "true",
  });
});

const verifyJWTToken = async (tokenToValidate) => {
  const possibleCacheHit = jwtCache.has(tokenToValidate);
  if (possibleCacheHit) return possibleCacheHit;
  console.log(`Send Request to http://${API_HOST}:${API_PORT}/api/version`);
  try {
    const req = await axios.get(`http://${API_HOST}:${API_PORT}/api/version`, {
      headers: {
        Authorization: tokenToValidate,
      },
    });
    jwtCache.add(tokenToValidate);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return false;
    }
    throw error;
  }
};

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

const start = async () => {
  try {
    await fastify.listen(LOGGER_PORT);
  } catch (err) {
    logger.fatal({ err }, "Error creating the log-server");
    process.exit(1);
  }
};
start();
