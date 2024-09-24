const config = {
  envMode: process.env.NODE_ENV || "development",
  version: process.env.REACT_APP_VERSION || "",
  exchangeRateUrl:
    process.env.REACT_APP_EXCHANGE_RATE_URL ||
    "https://data-api.ecb.europa.eu/service/data/EXR/D..EUR.SP00.A?lastNObservations=1",
  logging: {
    isEnabled: process.env.REACT_APP_LOGGING === "true" || false,
    logLevel: process.env.REACT_APP_LOG_LEVEL || "trace",
    serviceHost: process.env.REACT_APP_LOGGING_SERVICE_HOST || "localhost",
    servicePort: process.env.REACT_APP_LOGGING_SERVICE_PORT || "3001",
    isHostSSL: process.env.REACT_APP_LOGGING_SERVICE_HOST_SSL === "true" || false,
    pushInterval: Number(process.env.REACT_APP_LOGGING_PUSH_INTERVAL) || 20
  },
  email: {
    isEnabled: process.env.REACT_APP_EMAIL_SERVICE_ENABLED === "true" || false,
    serviceHost: process.env.EMAIL_HOST || "localhost",
    servicePort: process.env.EMAIL_PORT || "8890",
    serviceProtocol: process.env.EMAIL_PROTOCOL === "https" ? "https" : "http"
  },
  export: {
    isEnabled: process.env.REACT_APP_EXPORT_SERVICE_ENABLED === "true" || false,
    serviceHost: process.env.EXPORT_HOST || "localhost",
    servicePort: process.env.EXPORT_PORT || "8888",
    serviceProtocol: process.env.EXPORT_PROTOCOL === "https" ? "https" : "http"
  },
  authProxy: {
    enabled: process.env.REACT_APP_AUTHPROXY_ENABLED === "true" || false,
    url: process.env.REACT_APP_AUTHPROXY_URL || "http://localhost:4000/signin"
  },
  telemetry: {
    azureMonitorConnectionString: process.env.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING || undefined
  },
  pollingInterval: Number(process.env.REACT_APP_POLLING_INTERVAL) || 5000
};

export default config;
