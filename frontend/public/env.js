// These env vars are injected into frontend when using a docker image.
window.injectedEnv = {
  // Per default, do not request health from email-service
  REACT_APP_EMAIL_SERVICE_ENABLED: "false",
  // Per default, do not request health from excel-export-service
  REACT_APP_EXPORT_SERVICE_ENABLED: "false"
};
