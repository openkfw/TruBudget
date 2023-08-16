import { TelemetryClient, ApplicationInsightsOptions } from "applicationinsights";

const config: ApplicationInsightsOptions = {
  azureMonitorExporterConfig: {
    // Application Insights Connection String
    connectionString: process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"],
  },
};

export function getAppInsightsClient(): TelemetryClient {
  const telemetryClient = new TelemetryClient();
  return telemetryClient;
}
