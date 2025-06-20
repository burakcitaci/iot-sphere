import { create } from 'zustand';
import { telemetryService } from '@/services/telemetry';
import { OtelSpan, OtelLog, OtelMetric } from '@iot-sphere/entity-lib';

interface TelemetryState {
  spans: OtelSpan[];
  logs: OtelLog[];
  metrics: OtelMetric[];
  isLoading: {
    spans: boolean;
    logs: boolean;
    metrics: boolean;
  };
  error: {
    spans: Error | null;
    logs: Error | null;
    metrics: Error | null;
  };
  autoRefresh: {
    spans: boolean;
    logs: boolean;
    metrics: boolean;
  };
  // Actions
  fetchSpans: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  setAutoRefresh: (type: 'spans' | 'logs' | 'metrics', enabled: boolean) => void;
}

const maxItems = 100;

export const useTelemetryStore = create<TelemetryState>((set, get) => {
  // SSE unsubscribe refs
  let unsubscribeSpans: (() => void) | null = null;
  let unsubscribeLogs: (() => void) | null = null;
  let unsubscribeMetrics: (() => void) | null = null;

  // Helper to manage SSE subscriptions
  const manageSubscription = (
    type: 'spans' | 'logs' | 'metrics',
    enabled: boolean
  ) => {
    // Unsubscribe if disabling
    if (!enabled) {
      if (type === 'spans' && unsubscribeSpans) {
        unsubscribeSpans();
        unsubscribeSpans = null;
      }
      if (type === 'logs' && unsubscribeLogs) {
        unsubscribeLogs();
        unsubscribeLogs = null;
      }
      if (type === 'metrics' && unsubscribeMetrics) {
        unsubscribeMetrics();
        unsubscribeMetrics = null;
      }
      return;
    }
    // Subscribe if enabling
    if (type === 'spans' && !unsubscribeSpans) {
      unsubscribeSpans = telemetryService.subscribeToSpans(
        (span) => set(state => ({ spans: [span, ...state.spans].slice(0, maxItems) })),
        (err) => set(state => ({ error: { ...state.error, spans: new Error('Lost connection to spans stream') } }))
      );
    }
    if (type === 'logs' && !unsubscribeLogs) {
      unsubscribeLogs = telemetryService.subscribeToLogs(
        (log) => set(state => ({ logs: [log, ...state.logs].slice(0, maxItems) })),
        (err) => set(state => ({ error: { ...state.error, logs: new Error('Lost connection to logs stream') } }))
      );
    }
    if (type === 'metrics' && !unsubscribeMetrics) {
      unsubscribeMetrics = telemetryService.subscribeToMetrics(
        (metric) => set(state => ({ metrics: [metric, ...state.metrics].slice(0, maxItems) })),
        (err) => set(state => ({ error: { ...state.error, metrics: new Error('Lost connection to metrics stream') } }))
      );
    }
  };

  return {
    spans: [],
    logs: [],
    metrics: [],
    isLoading: { spans: true, logs: true, metrics: true },
    error: { spans: null, logs: null, metrics: null },
    autoRefresh: { spans: true, logs: true, metrics: true },
    fetchSpans: async () => {
      set(state => ({ isLoading: { ...state.isLoading, spans: true }, error: { ...state.error, spans: null } }));
      try {
        const spans = await telemetryService.getSpans();
        set(state => ({ spans, isLoading: { ...state.isLoading, spans: false } }));
      } catch (err) {
        set(state => ({
          error: { ...state.error, spans: err instanceof Error ? err : new Error('Failed to load spans data') },
          isLoading: { ...state.isLoading, spans: false },
        }));
      }
    },
    fetchLogs: async () => {
      set(state => ({ isLoading: { ...state.isLoading, logs: true }, error: { ...state.error, logs: null } }));
      try {
        const logs = await telemetryService.getLogs();
        set(state => ({ logs, isLoading: { ...state.isLoading, logs: false } }));
      } catch (err) {
        set(state => ({
          error: { ...state.error, logs: err instanceof Error ? err : new Error('Failed to load logs data') },
          isLoading: { ...state.isLoading, logs: false },
        }));
      }
    },
    fetchMetrics: async () => {
      set(state => ({ isLoading: { ...state.isLoading, metrics: true }, error: { ...state.error, metrics: null } }));
      try {
        const metrics = await telemetryService.getMetrics();
        set(state => ({ metrics, isLoading: { ...state.isLoading, metrics: false } }));
      } catch (err) {
        set(state => ({
          error: { ...state.error, metrics: err instanceof Error ? err : new Error('Failed to load metrics data') },
          isLoading: { ...state.isLoading, metrics: false },
        }));
      }
    },
    setAutoRefresh: (type, enabled) => {
      set(state => ({ autoRefresh: { ...state.autoRefresh, [type]: enabled } }));
      manageSubscription(type, enabled);
    },
  };
}); 