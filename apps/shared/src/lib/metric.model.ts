export interface OtelMetric {
    resource:     Resource;
    scopeMetrics: ScopeMetric[];
}

export interface Resource {
    _rawAttributes:          Array<string[]>;
    _asyncAttributesPending: boolean;
}

export interface ScopeMetric {
    scope:   Scope;
    metrics: Metric[];
}

export interface Metric {
    descriptor:             Descriptor;
    aggregationTemporality: number;
    dataPointType:          number;
    dataPoints:             DataPoint[];
    isMonotonic:            boolean;
}

export interface DataPoint {
    attributes: Attributes;
    startTime:  number[];
    endTime:    number[];
    value:      number;
}

export interface Attributes {
    method:      string;
    route:       string;
    status_code: string;
}

export interface Descriptor {
    name:        string;
    type:        string;
    description: string;
    unit:        string;
    valueType:   number;
    advice:      Advice;
}

export interface Advice {
}

export interface Scope {
    name:    string;
    version: string;
}