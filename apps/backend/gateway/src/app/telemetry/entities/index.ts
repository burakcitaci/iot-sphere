export * from './trace.entity';
export * from './log.entity';

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