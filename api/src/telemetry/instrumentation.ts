import * as opentelemetry from "@opentelemetry/sdk-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { diag } from "@opentelemetry/api";

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: process.env["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"],
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: "http://172.20.0.31:4318/v1/metrics", // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      headers: {}, // an optional object containing custom headers to be sent with each request
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

try {
  sdk.start();
  diag.info("OpenTelemetry automatic instrumentation started successfully");
} catch (error) {
  diag.error(
    "Error initializing OpenTelemetry SDK. Your application is not instrumented and will not produce telemetry",
    error,
  );
}

process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => diag.debug("OpenTelemetry SDK terminated"))
    .catch((error) => diag.error("Error terminating OpenTelemetry SDK", error));
});
