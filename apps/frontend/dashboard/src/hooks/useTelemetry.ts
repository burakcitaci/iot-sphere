import { useState, useEffect } from 'react';
import { telemetryService, Trace, Log } from '@/services/telemetry';

export function useTelemetry() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [tracesData, logsData] = await Promise.all([
          telemetryService.getTraces(),
          telemetryService.getLogs(),
        ]);
        setTraces(tracesData);
        setLogs(logsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load telemetry data'));
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    console.log('useTelemetry useEffect');
    const unsubscribeTraces = telemetryService.subscribeToTraces((trace) => {
      setTraces((prevTraces) => [trace, ...prevTraces]);
    });

    // const unsubscribeLogs = telemetryService.subscribeToLogs((log) => {
    //   setLogs((prevLogs) => [log, ...prevLogs]);
    // });

    return () => {
      unsubscribeTraces();
      //unsubscribeLogs();
    };
  }, []);

  const refreshData = async (startTime?: Date, endTime?: Date) => {
    try {
      setIsLoading(true);
      const [tracesData, logsData] = await Promise.all([
        telemetryService.getTraces(startTime, endTime),
        telemetryService.getLogs(startTime, endTime),
      ]);
      setTraces(tracesData);
      setLogs(logsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh telemetry data'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    traces,
    logs,
    isLoading,
    error,
    refreshData,
  };
} 