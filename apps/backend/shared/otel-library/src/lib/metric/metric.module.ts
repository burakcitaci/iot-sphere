import { Module } from '@nestjs/common';
import { MetricService } from './metric.service';
import { MetricExporter } from './metric.exporter';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { ConfigService } from '@nestjs/config';
import { metrics } from '@opentelemetry/api';
import { DaprClient } from '@dapr/dapr';
import { DAPR_CLIENT } from '../dapr/dapr.module';

@Module({
  imports: [],
  providers: [
    MetricService,
    {
      provide: 'OTEL_METER_PROVIDER',
      useFactory: (configService: ConfigService, daprClient: DaprClient) => {
        const serviceName = configService.get('resource.name');
        const serviceVersion = configService.get('resource.version');

    

        const metricsExporter = new MetricExporter(daprClient);

        // Create metric reader with periodic export
        const metricReader = new PeriodicExportingMetricReader({
          exporter: metricsExporter,
          exportIntervalMillis: configService.get('metrics.exportInterval', 3000), // Increased interval
          exportTimeoutMillis: configService.get('metrics.exportTimeout', 1000),
          
        });

        // Create meter provider with optimized settings
        const meterProvider = new MeterProvider({
          resource: resourceFromAttributes({
            'service.name': serviceName,
            'service.version': serviceVersion,
          }),
          readers: [metricReader],
          views: [
            // Configure views to control aggregation behavior
            {
              instrumentName: 'http_requests_total',
              meterName: serviceName,
            
            },
            {
              instrumentName: 'http_request_duration_ms',
              meterName: serviceName,
            
            },
          ],
        });

        // Register the meter provider globally
        metrics.setGlobalMeterProvider(meterProvider);

        // Register instrumentations for automatic metrics
       
        return meterProvider;
      },
      inject: [ConfigService, DAPR_CLIENT],
    },
  ],
  exports: [MetricService, 'OTEL_METER_PROVIDER'],
})
export class MetricModule {} 