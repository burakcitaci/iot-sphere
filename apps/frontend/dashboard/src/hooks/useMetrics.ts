import { useState, useEffect, useCallback, useRef } from 'react';
import { telemetryService } from '@/services/telemetry';
import { OtelMetric } from '@iot-sphere/entity-lib';

export function useMetrics(autoRefreshEnabled = true) {
  const [metrics, setMetrics] = useState<OtelMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeMetricsRef = useRef<() => void | null>(null);
  const maxMetrics = 100;

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement getMetrics in telemetryService
      const metricsData = await telemetryService.getMetrics();
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load metrics data'));
      console.error('❌ Metrics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMetricData = useCallback((metric: OtelMetric) => {
    setMetrics(prev => [metric, ...prev].slice(0, maxMetrics));
  }, []);

  const handleStreamError = useCallback((event: Event) => {
    console.error('⚠️ Metrics SSE error:', event);
    setError(new Error('Lost connection to metrics stream'));
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      unsubscribeMetricsRef.current?.();
      unsubscribeMetricsRef.current = null;
      return;
    }

    unsubscribeMetricsRef.current = telemetryService.subscribeToMetrics(handleMetricData, handleStreamError);

    return () => {
      unsubscribeMetricsRef.current?.();
      unsubscribeMetricsRef.current = null;
    };
  }, [autoRefreshEnabled, handleMetricData, handleStreamError]);

  return {
    metrics,
    isLoading,
    error,
    refreshData: fetchMetrics,
  };
} 