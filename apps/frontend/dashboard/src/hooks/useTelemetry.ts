import { useState, useEffect, useCallback, useRef } from 'react';
import { telemetryService } from '@/services/telemetry';
import { OtelLog, OtelSpan, OtelMetric } from '@iot-sphere/entity-lib';

export function useTelemetry(autoRefreshEnabled = true) {
  const [logs, setLogs] = useState<OtelLog[]>([]);
  const [spans, setSpans] = useState<OtelSpan[]>([]);
  const [metrics, setMetrics] = useState<OtelMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const unsubscribeSpansRef = useRef<() => void | null>(null);
  const unsubscribeLogsRef = useRef<() => void | null>(null);
  const unsubscribeMetricsRef = useRef<() => void | null>(null);

  const maxSpans = 100;
  const maxLogs = 100;
  const maxMetrics = 100;

  const fetchTelemetry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [spansData, logsData] = await Promise.all([
        telemetryService.getSpans(),
        telemetryService.getLogs(),
      ]);
      setSpans(spansData);
      setLogs(logsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load telemetry data'));
      console.error('❌ Telemetry fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSubscriptions = useCallback(() => {
    unsubscribeSpansRef.current?.();
    unsubscribeLogsRef.current?.();
    unsubscribeMetricsRef.current?.();
    unsubscribeSpansRef.current = null;
    unsubscribeLogsRef.current = null;
    unsubscribeMetricsRef.current = null;
  }, []);

  const handleSpanData = useCallback((span: OtelSpan) => {
    setSpans(prev => [span, ...prev].slice(0, maxSpans));
  }, []);

  const handleLogData = useCallback((log: OtelLog) => {
    setLogs(prev => [log, ...prev].slice(0, maxLogs));
  }, []);

  const handleMetricData = useCallback((metric: OtelMetric) => {
    setMetrics(prev => [metric, ...prev].slice(0, maxMetrics));
  }, []);

  const handleStreamError = useCallback((event: Event) => {
    console.error('⚠️ SSE error:', event);
    setError(new Error('Lost connection to telemetry stream'));
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      clearSubscriptions();
      return;
    }

    unsubscribeSpansRef.current = telemetryService.subscribeToSpans(handleSpanData, handleStreamError);
    unsubscribeLogsRef.current = telemetryService.subscribeToLogs(handleLogData, handleStreamError);
    unsubscribeMetricsRef.current = telemetryService.subscribeToMetrics(handleMetricData, handleStreamError);

    return clearSubscriptions;
  }, [autoRefreshEnabled, clearSubscriptions, handleSpanData, handleLogData, handleStreamError, handleMetricData]);

  return {
    logs,
    spans,
    metrics,
    isLoading,
    error,
    refreshData: fetchTelemetry,
  };
}
