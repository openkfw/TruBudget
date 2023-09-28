// These env vars are injected into frontend when using a docker image.
window.injectedEnv = {
  // Per default, do not request health from email-service
  REACT_APP_EMAIL_SERVICE_ENABLED: "false",
  // Per default, do not request health from excel-export-service
  REACT_APP_EXPORT_SERVICE_ENABLED: "false",
  // Per default, do not send log messages to log-server
  REACT_APP_LOGGING: "false",
  REACT_APP_LOG_LEVEL: "trace",
  REACT_APP_LOGGING_SERVICE_HOST: "localhost",
  REACT_APP_LOGGING_SERVICE_PORT: "3001",
  REACT_APP_LOGGING_SERVICE_HOST_SSL: "false",
  REACT_APP_LOGGING_PUSH_INTERVAL: 20,
  REACT_APP_AUTHBUDDY_ENABLED: "false",
  REACT_APP_AUTHBUDDY_URL: "localhost"
};
