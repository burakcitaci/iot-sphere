import { useLogs } from './useLogs';
import { useMetrics } from './useMetrics';
import { useSpans } from './useSpans';

export function useTelemetry(autoRefreshEnabled = true) {
  const logs = useLogs(autoRefreshEnabled);
  const metrics = useMetrics(autoRefreshEnabled);
  const spans = useSpans(autoRefreshEnabled);

  return {
    logs: logs.logs,
    metrics: metrics.metrics,
    spans: spans.spans,
    isLoading: logs.isLoading || metrics.isLoading || spans.isLoading,
    error: logs.error || metrics.error || spans.error,
    refreshData: () => {
      logs.refreshData();
      metrics.refreshData();
      spans.refreshData();
    },
  };
}
