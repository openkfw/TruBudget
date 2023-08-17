// import * as opentelemetry from "@opentelemetry/sdk-node";
// eslint-disable no-unused
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
// const { CollectorTraceExporter } = require("@opentelemetry/exporter-collector");
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
// import { BatchSpanProcessor } from "@opentelemetry/tracing";
import { BasicTracerProvider, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import * as api from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";

const contextManager = new AsyncHooksContextManager();
contextManager.enable();
api.context.setGlobalContextManager(contextManager);

// 1. create trace provider
const tracerProvider = new BasicTracerProvider();

registerInstrumentations({
  tracerProvider: tracerProvider,
  instrumentations: [getNodeAutoInstrumentations()],
});

// Initialize the exporter.
const options = {
  tags: [], // optional
  url: process.env["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"],
  // optional - collection of custom headers to be sent with each request, empty by default
  headers: {},
};

const exporter = new OTLPTraceExporter(options);

tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter));
// tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

/**
 * Registering the provider with the API allows it to be discovered
 * and used by instrumentation libraries. The OpenTelemetry API provides
 * methods to set global SDK implementations, but the default SDK provides
 * a convenience method named `register` which registers same defaults
 * for you.
 *
 * By default the NodeTracerProvider uses Trace Context for propagation
 * and AsyncHooksScopeManager for context management. To learn about
 * customizing this behavior, see API Registration Options below.
 */
// Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
tracerProvider.register();

// /* node sdk * /
// const sdk = new opentelemetry.NodeSDK({
//   traceExporter: new OTLPTraceExporter({
//     // optional - default url is http://localhost:4318/v1/traces
//     url: process.env["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"],
//     // optional - collection of custom headers to be sent with each request, empty by default
//     headers: {},
//   }),
//   metricReader: new PeriodicExportingMetricReader({
//     exporter: new OTLPMetricExporter({
//       url: "http://172.20.0.31:4318/v1/metrics", // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
//       headers: {}, // an optional object containing custom headers to be sent with each request
//     }),
//   }),
//   instrumentations: [getNodeAutoInstrumentations()],
// });
// sdk.start();

// try {
//   sdk.start();
//   diag.info("OpenTelemetry automatic instrumentation started successfully");
// } catch (error) {
//   diag.error(
//     "Error initializing OpenTelemetry SDK. Your application is not instrumented and will not produce telemetry",
//     error,
//   );
// }

// process.on("SIGTERM", () => {
//   sdk
//     .shutdown()
//     .then(() => diag.debug("OpenTelemetry SDK terminated"))
//     .catch((error) => diag.error("Error terminating OpenTelemetry SDK", error));
// });
