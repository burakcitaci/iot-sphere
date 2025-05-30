export interface Query {
    id: number;
    metric: string;
    aggregation: string;
    groupBy: string;
    filters: any[];
  }

    
  export type MetricType = 'counter' | 'histogram' | 'gauge';