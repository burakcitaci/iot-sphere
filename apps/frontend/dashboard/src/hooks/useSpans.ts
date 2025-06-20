import { useEffect } from 'react';
import { useTelemetryStore } from '@/store/telemetryStore';

export function useSpans(autoRefreshEnabled = true) {
  const spans = useTelemetryStore(state => state.spans);
  const isLoading = useTelemetryStore(state => state.isLoading.spans);
  const error = useTelemetryStore(state => state.error.spans);
  const fetchSpans = useTelemetryStore(state => state.fetchSpans);
  const setAutoRefresh = useTelemetryStore(state => state.setAutoRefresh);

  // Fetch on mount
  useEffect(() => {
    fetchSpans();
  }, [fetchSpans]);

  // Manage auto-refresh subscription
  useEffect(() => {
    setAutoRefresh('spans', autoRefreshEnabled);
    return () => setAutoRefresh('spans', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshEnabled]);

  return {
    spans,
    isLoading,
    error,
    refreshData: fetchSpans,
  };
} 