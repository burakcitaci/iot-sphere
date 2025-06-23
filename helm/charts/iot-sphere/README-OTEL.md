# OpenTelemetry Collector in IoT Sphere Helm Chart

This Helm chart includes an OpenTelemetry Collector that centralizes telemetry data collection from your applications.

## Overview

The OpenTelemetry Collector is deployed as a sidecar service that:
- Receives telemetry data (traces, metrics, logs) from your applications
- Processes and enriches the data
- Exports data to various backends

## Configuration

### Enabling/Disabling

The collector can be enabled or disabled via the `otelcol.enabled` value:

```yaml
otelcol:
  enabled: true  # Set to false to disable
```

### Ports

The collector exposes the following ports:

- **4317**: OTLP gRPC receiver
- **4318**: OTLP HTTP receiver  
- **14250**: Jaeger gRPC receiver
- **14268**: Jaeger HTTP receiver
- **9411**: Zipkin receiver

### Environment Variables

When the collector is enabled, your application will automatically receive these environment variables:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://dashboard-iot-sphere-otel-collector:4318
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_SERVICE_NAME=dashboard-iot-sphere
OTEL_RESOURCE_ATTRIBUTES=service.name=dashboard-iot-sphere,service.version=1.16.0
```

## Usage

### 1. Deploy with Collector

```bash
# Deploy the chart with OpenTelemetry Collector enabled
helm install dashboard ./helm/charts/iot-sphere \
  --set otelcol.enabled=true
```

### 2. Access Collector Endpoints

```bash
# Port forward to access collector endpoints
kubectl port-forward -n dashboard svc/dashboard-iot-sphere-otel-collector 4318:4318

# For gRPC endpoint
kubectl port-forward -n dashboard svc/dashboard-iot-sphere-otel-collector 4317:4317
```

### 3. Send Telemetry Data

Your applications can now send telemetry data to the collector:

```javascript
// Example: Send traces to the collector
const { trace } = require('@opentelemetry/api');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-http');

const exporter = new OTLPTraceExporter({
  url: 'http://dashboard-iot-sphere-otel-collector:4318/v1/traces'
});
```

## Configuration Options

### Customizing the Collector

You can customize the collector configuration in `values.yaml`:

```yaml
otelcol:
  enabled: true
  image:
    repository: otel/opentelemetry-collector
    tag: "0.96.0"
  
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    
    processors:
      batch:
        timeout: 1s
        send_batch_size: 1024
      memory_limiter:
        check_interval: 1s
        limit_mib: 1500
    
    exporters:
      console:
        loglevel: debug
      otlp:
        endpoint: "http://your-backend:4317"
        tls:
          insecure: true
    
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch, memory_limiter]
          exporters: [console, otlp]
```

### Adding Custom Exporters

To add custom exporters (e.g., to Jaeger, Zipkin, or other backends):

```yaml
otelcol:
  config:
    exporters:
      jaeger:
        endpoint: "http://jaeger:14268/api/traces"
      zipkin:
        endpoint: "http://zipkin:9411/api/v2/spans"
      prometheus:
        endpoint: "0.0.0.0:9464"
    
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [jaeger, zipkin]
        metrics:
          receivers: [otlp]
          processors: [batch]
          exporters: [prometheus]
```

## Troubleshooting

### Check Collector Status

```bash
# Check if collector pods are running
kubectl get pods -n dashboard -l app.kubernetes.io/component=otel-collector

# Check collector logs
kubectl logs -n dashboard deployment/dashboard-iot-sphere-otel-collector

# Check collector configuration
kubectl get configmap -n dashboard dashboard-iot-sphere-otel-collector-config -o yaml
```

### Verify Telemetry Flow

```bash
# Check if telemetry data is being received
kubectl logs -n dashboard deployment/dashboard-iot-sphere-otel-collector | grep "Received"

# Test OTLP endpoint
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{"resourceSpans":[]}'
```

## Integration with Existing Applications

Your existing applications that use the `@gateway/otel-library` will automatically send telemetry data to the collector when these environment variables are set:

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_PROTOCOL`
- `OTEL_SERVICE_NAME`
- `OTEL_RESOURCE_ATTRIBUTES`

The collector will receive traces, metrics, and logs from your NestJS applications and process them according to the configured pipelines. 