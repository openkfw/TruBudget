import {
  AzureMonitorOpenTelemetryClient,
  AzureMonitorOpenTelemetryOptions,
} from "@azure/monitor-opentelemetry";
import * as api from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";

// TODO context not working anymore :-(
const contextManager = new AsyncHooksContextManager();
contextManager.enable();
api.context.setGlobalContextManager(contextManager);

const options: AzureMonitorOpenTelemetryOptions = {
  azureMonitorExporterConfig: {
    connectionString: process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"],
  },
  otlpTraceExporterConfig: {
    enabled: true,
    url: process.env["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"], // url is optional and can be omitted - default is http://localhost:4318/v1/traces
  },
  otlpMetricExporterConfig: {
    enabled: true,
    url: "http://172.20.0.31:4318/v1/metrics", // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
  },
};
const azureMonitorClient = new AzureMonitorOpenTelemetryClient(options);
