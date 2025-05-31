import { useState, useEffect, useCallback, useRef } from 'react';
import { telemetryService } from '@/services/telemetry';
import { OtelSpan } from '@iot-sphere/entity-lib';

export function useSpans(autoRefreshEnabled = true) {
  const [spans, setSpans] = useState<OtelSpan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeSpansRef = useRef<() => void | null>(null);
  const maxSpans = 100;

  const fetchSpans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const spansData = await telemetryService.getSpans();
      setSpans(spansData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load spans data'));
      console.error('❌ Spans fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSpanData = useCallback((span: OtelSpan) => {
    setSpans(prev => [span, ...prev].slice(0, maxSpans));
  }, []);

  const handleStreamError = useCallback((event: Event) => {
    console.error('⚠️ Spans SSE error:', event);
    setError(new Error('Lost connection to spans stream'));
  }, []);

  useEffect(() => {
    fetchSpans();
  }, [fetchSpans]);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      unsubscribeSpansRef.current?.();
      unsubscribeSpansRef.current = null;
      return;
    }

    unsubscribeSpansRef.current = telemetryService.subscribeToSpans(handleSpanData, handleStreamError);

    return () => {
      unsubscribeSpansRef.current?.();
      unsubscribeSpansRef.current = null;
    };
  }, [autoRefreshEnabled, handleSpanData, handleStreamError]);

  return {
    spans,
    isLoading,
    error,
    refreshData: fetchSpans,
  };
} 