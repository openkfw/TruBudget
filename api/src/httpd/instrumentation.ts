import { useAzureMonitor, AzureMonitorOpenTelemetryOptions } from "@azure/monitor-opentelemetry";
import { metrics, trace, ProxyTracerProvider } from "@opentelemetry/api";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FastifyInstrumentation } from "@opentelemetry/instrumentation-fastify";

import { config } from "../config";

export const useAzureTelemetry = (): void => {
  if (config.azureMonitorConnectionString) {
    const options: AzureMonitorOpenTelemetryOptions = {
      azureMonitorExporterOptions: {
        connectionString: config.azureMonitorConnectionString,
      },
    };
    // Get the OpenTelemetry tracer provider and meter provider
    const tracerProvider = (trace.getTracerProvider() as ProxyTracerProvider).getDelegate();
    const meterProvider = metrics.getMeterProvider();
    useAzureMonitor(options);

    // Register the Fastify instrumentation
    registerInstrumentations({
      // List of instrumentations to register
      instrumentations: [
        new FastifyInstrumentation(), // Fastify instrumentation
      ],
      // OpenTelemetry tracer provider
      tracerProvider: tracerProvider,
      // OpenTelemetry meter provider
      meterProvider: meterProvider,
    });
  }
};
