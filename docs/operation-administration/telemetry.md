# Telemetry

## Introduction

Telemetry here refers to the collection of data from your TruBudget deployment that you can analyze to provide insights into its usage and performance. It is an optional feature. Telemetry is sent to the collector that you configure (see below) - we do not collect your data. Currently (July 2024) only Azure Monitor/Application Insights is supported with plans to use OpenTelemetry Protocol (OTLP) Exporter alongside.

## Instrumented services

Telemetry is enabled by setting the appropriate environment variables correctly, and turned off by leaving them blank. 

It is possible to gather metrics and traces only from frontend, or only api, or both. Traces from multiple services are collated in Application Insights.

### API

To collect telemetry from the API server, set the `APPLICATIONINSIGHTS_CONNECTION_STRING` environment variable to the Application Insights connection string.

### Frontend

To collect telemetry from TruBudget frontend running in a browser, set the `REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING` environment variable to the Application Insights connection string. It may, but doesn't necessarily have to, be the same as the target for api telemetry.