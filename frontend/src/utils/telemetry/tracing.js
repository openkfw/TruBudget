import React from "react";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { WebTracerProvider, SimpleSpanProcessor, ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-web");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { FetchInstrumentation } = require("@opentelemetry/instrumentation-fetch");
const { ZoneContextManager } = require("@opentelemetry/context-zone");
const { getWebAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-web");

const consoleExporter = new ConsoleSpanExporter();

const collectorExporter = new OTLPTraceExporter({
  headers: {}
});

const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "trubudget-frontend"
  })
});

const fetchInstrumentation = new FetchInstrumentation({});

fetchInstrumentation.setTracerProvider(provider);

provider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter));

provider.addSpanProcessor(new SimpleSpanProcessor(collectorExporter));

provider.addSpanProcessor(
  new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: `http://localhost:4318/v1/traces`
    })
  )
);

provider.register({ contextManager: new ZoneContextManager() });

registerInstrumentations({
  instrumentations: [
    fetchInstrumentation,
    getWebAutoInstrumentations({
      // load custom configuration for xml-http-request instrumentation
      "@opentelemetry/instrumentation-xml-http-request": {
        clearTimingResources: true
      }
    })
  ],
  tracerProvider: provider
});

export default function TraceProvider({ children }) {
  return <>{children}</>;
}
