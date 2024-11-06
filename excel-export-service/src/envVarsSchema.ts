import * as Joi from "joi";

export const envVarsSchema = Joi.object({
  API_HOST: Joi.string().default("localhost").note("Hots/IP address of the API service."),
  API_PORT: Joi.number().port().default(8080).note("Port of the API service."),
  API_PROTOCOL: Joi.string()
    .allow("http", "https")
    .default("http")
    .note("Protocol of the API service."),
  PORT: Joi.number().port().default(8888).note("The port used to expose the excel-export service."),
  ACCESS_CONTROL_ALLOW_ORIGIN: Joi.string()
    .default("*")
    .note(
      "Since the export service uses CORS, the domain by which it can be called needs to be set. Setting this value to `" +
        "` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).",
    ),
  RATE_LIMIT: Joi.number()
    .empty("")
    .note("Defines the limit each IP to RATE_LIMIT requests per windowMs (1 minute)"),
  NODE_ENV: Joi.string().default("production"),
  LOG_LEVEL: Joi.string()
    .allow("trace", "debug", "info", "warn", "error", "fatal")
    .default("info")
    .note("Defines the log output."),
  CI_COMMIT_SHA: Joi.string()
    .default("")
    .note("Defines the CI_COMMIT_SHA property returned by the version endpoint."),
  BUILDTIMESTAMP: Joi.string().note(
    "Defines the BUILDTIMESTAMP property returned by the version endpoint.",
  ),
})
  .unknown()
  .required();
