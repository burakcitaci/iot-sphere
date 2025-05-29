export interface OtelLog {
    body: any;
    severityText?: string;
    hrTime?: [number, number]; // hrTime is a tuple like [seconds, nanoseconds]
    serviceName?: string;
    serviceVersion?: string;
    environment?: string;
    host?: string;
  }