import { fetchClient } from '@/lib/fetch-client';
import config from '@/config/config';

export interface Trace {
  id: string;
  traceId: string;
  name: string;
  timestamp: Date;
  duration: number;
  status: string;
  spans: any[];
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface Log {
  id: string;
  timestamp: Date;
  level: string;
  message: string;
  service: string;
  traceId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export const telemetryService = {
  async getTraces(startTime?: Date, endTime?: Date): Promise<Trace[]> {
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime.toISOString());
    if (endTime) params.append('endTime', endTime.toISOString());
    
    const response = await fetchClient.get<Trace[]>(`/telemetry/traces?${params}`);
    return[];
  },

  async getLogs(startTime?: Date, endTime?: Date): Promise<Log[]> {
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime.toISOString());
    if (endTime) params.append('endTime', endTime.toISOString());
    
    const response = await fetchClient.get<Log[]>(`/telemetry/logs?${params}`);
    return []
  },

  subscribeToTraces(callback: (trace: Trace) => void) {
    const eventSource = new EventSource(`${config.api.baseUrl}/devices/telemetry`, {withCredentials:false});
   
    eventSource.onmessage = (event) => {
      console.log('Received trace:', event);
      const trace = JSON.parse(event.data);
      
       callback(trace);
    };
    console.log('TRace connected:', eventSource);
    return () => eventSource.close();
  },

  subscribeToLogs(callback: (log: Log) => void) {
    let eventSource: EventSource | null = null;
    
    const connect = () => {
      if (eventSource) {
        eventSource.close(); // Close any existing connection before creating a new one
      }
  
      eventSource = new EventSource(`${config.api.baseUrl}/telemetry/logs`);
      console.log('SSE connected:', eventSource);
  
      eventSource.onmessage = (event) => {
        const log = JSON.parse(event.data);
        console.log('Received log:', log);
        callback(log);
      };
  
      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        eventSource?.close();
  
        // Attempt to reconnect after a delay
        setTimeout(() => {
          console.log('Reconnecting to SSE...');
          connect();
        }, 3000);
      };
    };
  
    connect();
  
    return () => {
      console.log('Closing SSE connection');
      eventSource?.close();
    };
  }
  
}; 