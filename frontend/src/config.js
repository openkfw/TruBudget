const config = {
  envMode: process.env.NODE_ENV || "development",
  version: process.env.REACT_APP_VERSION || "",
  logging: {
    isEnabled: process.env.REACT_APP_LOGGING === "true" ? true : false,
    logLevel: process.env.REACT_APP_LOG_LEVEL || "trace",
    serviceHost: process.env.REACT_APP_LOGGING_SERVICE_HOST || "localhost",
    servicePort: process.env.REACT_APP_LOGGING_SERVICE_PORT || "3001",
    isHostSSL: process.env.REACT_APP_LOGGING_SERVICE_HOST_SSL === "true" ? true : false,
    pushInterval: Number(process.env.REACT_APP_LOGGING_PUSH_INTERVAL) || 20
  },
  email: {
    isEnabled: process.env.REACT_APP_EMAIL_SERVICE_ENABLED === "true" ? true : false,
    servicePort: process.env.EMAIL_PORT || "8890"
  },
  export: {
    isEnabled: process.env.REACT_APP_EXPORT_SERVICE_ENABLED === "true" ? true : false,
    servicePort: process.env.EXPORT_PORT || "8888"
  }
};

export default config;
