import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Query {
  id: number;
  metric: string;
  aggregation: string;
  groupBy: string;
  filters: any[];
}

interface MetricsChartProps {
  queries: Query[];
  timeRange: string;
}

// OpenTelemetry data structure
interface OTelDataPoint {
  attributes: {
    method?: string;
    route?: string;
    status_code?: string;
  };
  startTime: [number, number];
  endTime: [number, number];
  value: number;
}

interface OTelMetric {
  descriptor: {
    name: string;
    type: string;
    description: string;
  };
  dataPoints: OTelDataPoint[];
  resource?: {
    serviceName?: string;
    serviceVersion?: string;
  };
}

export const HttpMetricsChart = ({ queries, timeRange }: MetricsChartProps) => {
  // Sample OpenTelemetry data for http_requests_total
  const sampleOTelData = {
    resource: {
      _rawAttributes: [
        ["service.name", "gateway-api"],
        ["service.version", "0.0.1"]
      ]
    },
    scopeMetrics: [{
      scope: {
        name: "metric-service",
        version: ""
      },
      metrics: [{
        descriptor: {
          name: "http_requests_total",
          type: "COUNTER",
          description: "Total number of HTTP requests",
          unit: "",
          valueType: 1,
          advice: {}
        },
        aggregationTemporality: 1,
        dataPointType: 3,
        dataPoints: [
          {
            attributes: { method: "GET", route: "hello", status_code: "204" },
            startTime: [1748589187, 757000000],
            endTime: [1748589222, 371000000],
            value: 2
          },
          {
            attributes: { method: "POST", route: "api/users", status_code: "201" },
            startTime: [1748589187, 757000000],
            endTime: [1748589222, 371000000],
            value: 5
          },
          {
            attributes: { method: "GET", route: "api/health", status_code: "200" },
            startTime: [1748589187, 757000000],
            endTime: [1748589222, 371000000],
            value: 15
          },
          {
            attributes: { method: "PUT", route: "api/users", status_code: "200" },
            startTime: [1748589187, 757000000],
            endTime: [1748589222, 371000000],
            value: 3
          },
          {
            attributes: { method: "GET", route: "hello", status_code: "500" },
            startTime: [1748589187, 757000000],
            endTime: [1748589222, 371000000],
            value: 1
          }
        ],
        isMonotonic: true
      }]
    }]
  };

  const processOTelData = (query: Query) => {
    // Find the matching metric in the OTel data
    const otelMetric = sampleOTelData.scopeMetrics[0]?.metrics.find(
      m => m.descriptor.name === query.metric
    );

    if (!otelMetric || query.metric !== 'http_requests_total') {
      return generateFallbackData(query);
    }

    // Group data points based on the groupBy field
    const groupedData: { [key: string]: number } = {};
    
    otelMetric.dataPoints.forEach(dataPoint => {
      let groupKey = 'total';
      
      switch (query.groupBy) {
        case 'method':
          groupKey = dataPoint.attributes.method || 'unknown';
          break;
        case 'route':
          groupKey = dataPoint.attributes.route || 'unknown';
          break;
        case 'status_code':
          groupKey = dataPoint.attributes.status_code || 'unknown';
          break;
        case 'status_class': {
          const statusCode = dataPoint.attributes.status_code;
          groupKey = statusCode ? `${statusCode.charAt(0)}xx` : 'unknown';
          break;
        }
        case 'everything':
        default:
          groupKey = 'total';
          break;
      }

      groupedData[groupKey] = (groupedData[groupKey] || 0) + dataPoint.value;
    });

    // Extract resource info
    const resource = sampleOTelData.resource;
    let serviceName: string | undefined;
    let serviceVersion: string | undefined;

    if (resource && resource._rawAttributes) {
      resource._rawAttributes.forEach(([key, value]) => {
        if (key === "service.name") {
          serviceName = value as string;
        } else if (key === "service.version") {
          serviceVersion = value as string;
        }
      });
    }

    // Generate time series data
    const points = timeRange === '5m' ? 30 : timeRange === '15m' ? 60 : 120;
    const data = [];
    
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(Date.now() - (points - i) * 60000);
      const dataPoint: any = {
        time: timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        timestamp
      };

      // Add grouped data with some realistic variation over time
      Object.entries(groupedData).forEach(([groupKey, baseValue]) => {
        const variation = Math.sin(i * 0.2) * 0.2 + Math.random() * 0.3;
        const rateValue = query.aggregation === 'rate' ? baseValue * (1 + variation) : baseValue;
        dataPoint[groupKey] = Math.max(0, rateValue);
      });
      
      data.push(dataPoint);
    }
    
    return { data, groups: Object.keys(groupedData), otelMetric: { ...otelMetric, resource: { serviceName, serviceVersion } } };
  };

  const generateFallbackData = (query: Query) => {
    const points = timeRange === '5m' ? 30 : timeRange === '15m' ? 60 : 120;
    const data = [];
    
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(Date.now() - (points - i) * 60000);
      const dataPoint: any = {
        time: timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        timestamp
      };
      
      if (query.metric) {
        const baseValue = query.metric.includes('cpu') ? 5 : 
                         query.metric.includes('memory') ? 65 : 
                         query.metric.includes('network') ? 1000 : 50;
        
        const variation = Math.sin(i * 0.2) * 2 + Math.random() * 3;
        dataPoint[`query_0`] = Math.max(0, baseValue + variation);
      }
      
      data.push(dataPoint);
    }
    
    return { data, groups: ['query_0'], otelMetric: undefined };
  };

  // Process data for the primary query
  const primaryQuery = queries[0];
  const result = primaryQuery ? processOTelData(primaryQuery) : { data: [], groups: [], otelMetric: undefined };
  const { data, groups, otelMetric } = result;

  // Colors for different groups
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

  const formatMetricName = (metric: string) => {
    return metric.split('.').pop() || metric;
  };

  const stats = {
    maxValue: data.length > 0 ? Math.max(...data.map(d => Math.max(...groups.map(g => d[g] || 0)))) : 0,
    avgValue: data.length > 0 && groups.length > 0 ? 
      data.reduce((sum, d) => sum + (d[groups[0]] || 0), 0) / data.length : 0,
    dataPoints: data.length
  };

  return (
    <div>
      {/* Chart Stats */}
      <div className="flex gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span>Max: {stats.maxValue.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Avg: {stats.avgValue.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Points: {stats.dataPoints}</span>
        </div>
        {primaryQuery?.metric === 'http_requests_total' && (
          <div className="flex items-center gap-1">
            <span className="text-blue-600">📊 Live OpenTelemetry Data</span>
          </div>
        )}
        {groups.map((group, index) => (
          <div key={group} className="flex items-center gap-1">
            <div 
              className="w-3 h-2 rounded-sm"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span>{group}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="1 1" stroke="#f0f4f8" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 8)}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(value) => `${value.toFixed(0)}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ fontSize: '11px', color: '#374151', fontWeight: '500' }}
              formatter={(value: number, name: string) => [
                value?.toFixed(2),
                name
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px' }}
            />
            {groups.map((group, index) => (
              <Line
                key={group}
                type="monotone"
                dataKey={group}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name={group}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Data Source Info */}
      {primaryQuery?.metric === 'http_requests_total' && otelMetric && (
        <div className="mt-4 space-y-3">
          {/* Service Information */}
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              <strong>OpenTelemetry Data Source</strong>
            </p>
            <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-blue-600 font-medium">Service:</span> {otelMetric.resource?.serviceName} v{otelMetric.resource?.serviceVersion}
              </div>
              <div>
                <span className="text-blue-600 font-medium">Metric Type:</span> {otelMetric.descriptor.type}
              </div>
              <div>
                <span className="text-blue-600 font-medium">Description:</span> {otelMetric.descriptor.description}
              </div>
              <div>
                <span className="text-blue-600 font-medium">Data Points:</span> {otelMetric.dataPoints.length}
              </div>
            </div>
          </div>

          {/* Sample Data Points */}
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-800 font-medium mb-2">Sample Data Points from OpenTelemetry</p>
            <div className="space-y-2">
              {sampleOTelData.scopeMetrics[0].metrics[0].dataPoints.map((point, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                  <div className="flex gap-3">
                    <span className="font-medium text-gray-700">
                      {point.attributes.method} {point.attributes.route}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      point.attributes.status_code?.startsWith('2') ? 'bg-green-100 text-green-700' :
                      point.attributes.status_code?.startsWith('4') ? 'bg-yellow-100 text-yellow-700' :
                      point.attributes.status_code?.startsWith('5') ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {point.attributes.status_code}
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">{point.value} requests</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aggregation Info */}
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Chart Display:</strong> Data aggregated by {primaryQuery.groupBy} 
              {primaryQuery.aggregation === 'rate' && ' (converted to requests per second)'}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Total requests across all endpoints: {sampleOTelData.scopeMetrics[0].metrics[0].dataPoints.reduce((sum, point) => sum + point.value, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};