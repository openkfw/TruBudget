require("dotenv").config();
const { API_HOST, API_PORT, LOGGER_PORT } = process.env;
if (!API_HOST || !API_PORT || !LOGGER_PORT) {
  console.log("Please provide all requierd ENV variables!");
  return;
}
const logBuilder = require("./index");
const axios = require("axios");
const jwtCache = new Set();
const fastify = require("fastify")({
  logger: false,
});
const logger = logBuilder.createPinoLogger("Trubudget-Frontend");

setInterval(() => {
  logger.info("Clearing JWT Cache");
  jwtCache.clear();
}, 60 * 20 * 1000);

fastify.register(require("fastify-cors"), {
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
      if (!(await verifyJWTToken(tokenToValidate)))
        reply.status(401).send("Please provide authorization token");
    } else {
      reply.status(401).send("Please provide authorization token");
    }

    toStdOut(request.body);

    reply.status(200).send({
      status: "ok",
    });
  } catch (e) {
    console.log(e);
    reply.status(500).send("Ups ...");
  }
});

const verifyJWTToken = async (tokenToValidate) => {
  const possibleCacheHit = jwtCache.has(tokenToValidate);
  if (possibleCacheHit) return possibleCacheHit;

  const req = await axios.get(`http://${API_HOST}:${API_PORT}/api/version`, {
    headers: {
      Authorization: tokenToValidate,
    },
  });
  jwtCache.add(tokenToValidate);
  return req.status === 200;
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
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
