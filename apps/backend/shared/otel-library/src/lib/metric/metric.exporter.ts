import { PushMetricExporter, ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { DaprClient } from '@dapr/dapr';

export class MetricExporter implements PushMetricExporter {
    private lastExportedValues = new Map<string, number>();
    private isExporting = false;
  
    constructor(private readonly daprClient: DaprClient) {}

  
    async export(
      metrics: ResourceMetrics,
      resultCallback: (result: ExportResult) => void
    ): Promise<void> {
      if (this.isExporting) {
        resultCallback({ code: ExportResultCode.SUCCESS });
        return;
      }
  
      this.isExporting = true;
  
      try {
        // Check if we have any new metric values
        const hasNewValues = this.hasNewMetricValues(metrics);
        
        if (!hasNewValues) {
        
          resultCallback({ code: ExportResultCode.SUCCESS });
          return;
        }
  
       const metric = metrics;
       await this.daprClient.pubsub.publish(
        'pubsub3',
        'my-metric',
        JSON.stringify(metric)
      );
        resultCallback({ code: ExportResultCode.SUCCESS });
        
      } catch (error) {
        //this.logService.error('Failed to export metrics', error, 'MetricsExporter');
        resultCallback({ 
          code: ExportResultCode.FAILED,
          error: error instanceof Error ? error : new Error(String(error))
        });
      } finally {
        this.isExporting = false;
      }
    }
  
    private hasNewMetricValues(metrics: ResourceMetrics): boolean {
      if (!metrics.scopeMetrics || metrics.scopeMetrics.length === 0) {
        return false;
      }
  
      let hasNewValues = false;
  
      for (const scopeMetric of metrics.scopeMetrics) {
        for (const metric of scopeMetric.metrics) {
          const metricKey = `${scopeMetric.scope.name}:${metric.descriptor.name}`;
          
          // Get current value from first data point
          const currentValue = metric.dataPoints?.[0]?.value;
          if (currentValue === undefined) continue;
  
          const lastValue = this.lastExportedValues.get(metricKey);
          
          // If this is a new metric or value has changed
          // Check if currentValue is a number before comparing and setting
          if (typeof currentValue === 'number' && (lastValue === undefined || lastValue !== currentValue)) {
            this.lastExportedValues.set(metricKey, currentValue);
            hasNewValues = true;
          }
        }
      }
  
      return hasNewValues;
    }
  
    async shutdown(): Promise<void> {
      //this.logService.log('Metrics exporter shutting down', 'MetricsExporter');
    }
  
    async forceFlush(): Promise<void> {
      //this.logService.log('Force flushing metrics', 'MetricsExporter');
    }
  
    private transformMetrics(metrics: ResourceMetrics): any {
      // Filter out empty or invalid metrics
      const validScopeMetrics = metrics.scopeMetrics?.filter(scopeMetric => 
        scopeMetric.metrics && scopeMetric.metrics.length > 0
      ) || [];
  
      // Transform OpenTelemetry metrics to your desired format
      return {
        timestamp: Date.now(),
        resource: {
          attributes: metrics.resource.attributes,
        },
        metrics: validScopeMetrics.map(scopeMetric => ({
          scope: {
            name: scopeMetric.scope.name,
            version: scopeMetric.scope.version,
          },
          metrics: scopeMetric.metrics.map(metric => ({
            name: metric.descriptor.name,
            description: metric.descriptor.description,
            unit: metric.descriptor.unit,
            dataPoints: metric.dataPoints || [],
          })),
        })),
      };
    }
}