import { useState, useEffect, useCallback, useRef } from 'react';
import { telemetryService } from '@/services/telemetry';
import { OtelLog } from '@iot-sphere/entity-lib';

export function useLogs(autoRefreshEnabled = true) {
  const [logs, setLogs] = useState<OtelLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeLogsRef = useRef<() => void | null>(null);
  const maxLogs = 100;

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const logsData = await telemetryService.getLogs();
      setLogs(logsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load logs data'));
      console.error('❌ Logs fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogData = useCallback((log: OtelLog) => {
    setLogs(prev => [log, ...prev].slice(0, maxLogs));
  }, []);

  const handleStreamError = useCallback((event: Event) => {
    console.error('⚠️ Logs SSE error:', event);
    setError(new Error('Lost connection to logs stream'));
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      unsubscribeLogsRef.current?.();
      unsubscribeLogsRef.current = null;
      return;
    }

    unsubscribeLogsRef.current = telemetryService.subscribeToLogs(handleLogData, handleStreamError);

    return () => {
      unsubscribeLogsRef.current?.();
      unsubscribeLogsRef.current = null;
    };
  }, [autoRefreshEnabled, handleLogData, handleStreamError]);

  return {
    logs,
    isLoading,
    error,
    refreshData: fetchLogs,
  };
} 