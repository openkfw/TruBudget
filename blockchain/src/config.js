const envVarsSchema = require("./envVarsSchema");

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  orgazation: envVars.ORGANIZATION,
  port: envVars.PORT,
  multichain: {
    rpcPort: envVars.MULTICHAIN_RPC_PORT,
    rpcUser: envVars.MULTICHAIN_RPC_USER,
    rpcPassword: envVars.MULTICHAIN_RPC_PASSWORD,
    rpcAllowIp: envVars.RPC_ALLOW_IP,
    dir: envVars.MULTICHAIN_DIR,
  },
  api: {
    protocol: envVars.API_PROTOCOL,
    host: envVars.API_HOST,
    port: envVars.API_PORT,
  },
  p2p: {
    host: envVars.P2P_HOST,
    port: envVars.P2P_PORT,
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    ssl: envVars.EMAIL_SSL,
    serviceEnabled: envVars.EMAIL_SERVICE_ENABLED,
    jwtSecret: envVars.JWT_SECRET,
  },
  notification: {
    path: envVars.NOTIFICATION_PATH,
    maxLifetime: envVars.NOTIFICATION_MAX_LIFETIME,
    sendInterval: envVars.NOTIFICATION_SEND_INTERVAL,
  },
  cert: {
    path: envVars.CERT_PATH,
    caPath: envVars.CERT_CA_PATH,
    keyPath: envVars.CERT_KEY_PATH,
  },
  externalIp: envVars.EXTERNAL_IP,
  autostart: envVars.AUTOSTART,
  nodeEnv: envVars.NODE_ENV,
  blocknotifyScript: envVars.BLOCKNOTIFY_SCRIPT,
  kubeServiceName: envVars.KUBE_SERVICE_NAME,
  kubeNamespace: envVars.KUBE_NAMESPACE,
  exposeMc: envVars.EXPOSE_MC,
};

module.exports = config;
