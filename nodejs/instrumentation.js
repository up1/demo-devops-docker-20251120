const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-grpc");
const {
  OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-grpc");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");

const {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
} = require("@opentelemetry/resources");

const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const {
  MySQL2Instrumentation,
} = require("@opentelemetry/instrumentation-mysql2");

const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-node");

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP || "http://localhost:4317/v1/traces",
  }),
  // traceExporter: new ConsoleSpanExporter(),
  instrumentations: [
    getNodeAutoInstrumentations({
      // only instrument fs if it is part of another trace
      "@opentelemetry/instrumentation-fs": {
        requireParentSpan: true,
      },
    }),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new MySQL2Instrumentation(),
  ],
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  }),
  resourceDetectors: [envDetector, hostDetector, osDetector, processDetector],
});

sdk.start();
