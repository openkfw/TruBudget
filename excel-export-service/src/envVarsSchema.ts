import * as Joi from "joi";

export const envVarsSchema = Joi.object({
  API_HOST: Joi.string()
    .allow("", null)
    .empty(["", null])
    .default("localhost")
    .note("Hots/IP address of the API service."),
  API_PORT: Joi.number()
    .port()
    .allow("", null)
    .empty(["", null])
    .default(8080)
    .note("Port of the API service."),
  API_PROTOCOL: Joi.string()
    .allow("http", "https", "", null)
    .empty(["", null])
    .default("http")
    .note("Protocol of the API service."),
  PORT: Joi.number()
    .port()
    .allow("", null)
    .empty(["", null])
    .default(8888)
    .note("The port used to expose the excel-export service."),
  ACCESS_CONTROL_ALLOW_ORIGIN: Joi.string()
    .allow("", null)
    .empty(["", null])
    .default("*")
    .note(
      "Since the export service uses CORS, the domain by which it can be called needs to be set. Setting this value to `" +
        "` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).",
    ),
  RATE_LIMIT: Joi.number()
    .allow("", null)
    .empty(["", null])
    .empty("")
    .note("Defines the limit each IP to {RATE_LIMIT} requests per windowMs (1 minute)"),
  NODE_ENV: Joi.string().allow("", null).empty(["", null]).default("production"),
  LOG_LEVEL: Joi.string()
    .allow("trace", "debug", "info", "warn", "error", "fatal", "", null)
    .empty(["", null])
    .default("info")
    .note("Defines the log output."),
  CI_COMMIT_SHA: Joi.string()
    .allow("", null)
    .empty(["", null])
    .default("")
    .note("Defines the CI_COMMIT_SHA property returned by the version endpoint."),
  BUILDTIMESTAMP: Joi.string()
    .allow("", null)
    .empty(["", null])
    .note("Defines the BUILDTIMESTAMP property returned by the version endpoint."),
})
  .unknown()
  .required();
