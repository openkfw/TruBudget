const Joi = require("joi");

const envVarsSchema = Joi.object({
  PORT: Joi.number().port().default(8085),
  ORGANIZATION: Joi.string().default("MyOrga"),
  MULTICHAIN_RPC_PORT: Joi.number().port().default(8000).required(),
  MULTICHAIN_RPC_USER: Joi.string().default("multichainrpc").required(),
  MULTICHAIN_RPC_PASSWORD: Joi.string().min(32).required(),
  RPC_ALLOW_IP: Joi.string().default("0.0.0.0/0"),
  CERT_PATH: Joi.string(),
  CERT_CA_PATH: Joi.string(),
  CERT_KEY_PATH: Joi.string(),
  AUTOSTART: Joi.boolean().default(true),
  EXTERNAL_IP: Joi.string(),
  P2P_HOST: Joi.string(),
  P2P_PORT: Joi.number().port().default(7447),
  API_PROTOCOL: Joi.string().allow("http", "https").default("http"),
  API_HOST: Joi.string().default("localhost"),
  API_PORT: Joi.number().port().default(8080),
  MULTICHAIN_DIR: Joi.string().default("/root"),
  EMAIL_HOST: Joi.string().when("EMAIL_SERVICE_ENABLED", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  EMAIL_PORT: Joi.number().when("EMAIL_SERVICE_ENABLED", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  EMAIL_SSL: Joi.boolean().default(false),
  NOTIFICATION_PATH: Joi.string().default("./notifications/"),
  NOTIFICATION_MAX_LIFETIME: Joi.number().default(24),
  NOTIFICATION_SEND_INTERVAL: Joi.number().default(10),
  JWT_SECRET: Joi.string().when("EMAIL_SERVICE_ENABLED", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  EMAIL_SERVICE_ENABLED: Joi.boolean().default(false),
  MULTICHAIN_FEED_ENABLED: Joi.boolean().default(false),
  NODE_ENV: Joi.string().default("production"),
  BLOCKNOTIFY_SCRIPT: Joi.string(),
  KUBE_SERVICE_NAME: Joi.string().default(""),
  KUBE_NAMESPACE: Joi.string().default(""),
  EXPOSE_MC: Joi.boolean().default(false),
});

module.exports = envVarsSchema;
