import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'ecochain',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '0.1.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  })
);

const traceExporter = new OTLPTraceExporter({
  url: process.env.GRAFANA_CLOUD_OTLP_ENDPOINT || 'http://localhost:4317',
  headers: {
    Authorization: `Bearer ${process.env.GRAFANA_CLOUD_API_KEY || ''}`,
  },
});

const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [
    new HttpInstrumentation(),
    new FetchInstrumentation(),
  ],
});

export function initializeTelemetry() {
  sdk.start();
  console.log('OpenTelemetry initialized');
}

export function shutdownTelemetry() {
  return sdk.shutdown();
}
