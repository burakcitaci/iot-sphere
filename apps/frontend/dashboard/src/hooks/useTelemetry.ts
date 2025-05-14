import { useState, useEffect, useCallback, useRef } from 'react';
import { telemetryService, type SpanData, type CustomLogRecord, SafeLog } from '@/services/telemetry';
import { ReadableSpan } from '@opentelemetry/sdk-trace-node';


export function useTelemetry(autoRefreshEnabled = true) {
  const [logs, setLogs] = useState<SafeLog[]>([]);
  const [spans, setSpans] = useState<ReadableSpan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<() => void | null>(null);
  const logEventSourceRef = useRef<() => void | null>(null);
  const maxSpans = 100;
  const maxLogs = 100;

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [spansData, logsData] = await Promise.all([
        telemetryService.getSpans(),
        telemetryService.getLogs(),
      ]);
      setSpans(spansData);
      setLogs(logsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load telemetry data'));
      console.error('Error loading telemetry data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [spansData, logsData] = await Promise.all([
        telemetryService.getSpans(),
        telemetryService.getLogs(),
      ]);
      setSpans(spansData);
      setLogs(logsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh telemetry data'));
      console.error('Error refreshing telemetry data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup SSE subscription
  useEffect(() => {
    if (!autoRefreshEnabled) {
      if (eventSourceRef.current) {
        eventSourceRef.current();
        eventSourceRef.current = null;
      }
      if (logEventSourceRef.current) {
        logEventSourceRef.current();
        logEventSourceRef.current = null;
      }
      return;
    }

    const handleSpanData = (span: ReadableSpan) => {
      console.log('New span data received:', span);
      setSpans(prevSpans => {
        const newSpans = [span, ...prevSpans];
        return newSpans.slice(0, maxSpans);
      });
    };

    const handleLogData = (log: SafeLog) => {
      console.log(log)
      setLogs(prevLogs => {
        const newLogs = [log, ...prevLogs];
        return newLogs.slice(0, maxLogs);
      });
    };

    const handleError = (error: Event) => {
      console.error('Span stream error:', error);
      setError(new Error('Lost connection to span stream'));
    };

    // Subscribe to span and log streams
    eventSourceRef.current = telemetryService.subscribeToSpans(handleSpanData, handleError);
    logEventSourceRef.current = telemetryService.subscribeToLogs(handleLogData, handleError);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current();
        eventSourceRef.current = null;
      }
      if (logEventSourceRef.current) {
        logEventSourceRef.current();
        logEventSourceRef.current = null;
      }
    };
  }, [autoRefreshEnabled, maxSpans, maxLogs]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    logs,
    spans,
    isLoading,
    error,
    refreshData,
  };
} 