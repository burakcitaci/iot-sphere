import { Plus } from 'lucide-react';
import { MetricType, Query } from './utils';



interface QueryBuilderProps {
  queries: Query[];
  metrics: string[];
  onAddQuery: () => void;
  onUpdateQuery: (id: number, updates: Partial<Query>) => void;
  onRemoveQuery: (id: number) => void;
}

// Enhanced aggregations - rate is particularly useful for counters like http_requests_total
const aggregations: string[] = ['avg', 'sum', 'min', 'max', 'count', 'rate', 'increase'];

// Enhanced groupBy options including HTTP-specific attributes
const groupByOptions: string[] = [
  'everything', 
  'host', 
  'service', 
  'environment', 
  'region',
  // HTTP-specific grouping options
  'method',      // GET, POST, etc.
  'route',       // API endpoints
  'status_code', // HTTP status codes
  'status_class' // 2xx, 4xx, 5xx
];

// Get metric type for better UX
const getMetricType = (metricName: string): MetricType => {
  if (metricName.includes('_total') || metricName.includes('count')) return 'counter';
  if (metricName.includes('duration') || metricName.includes('time')) return 'histogram';
  if (metricName.includes('size') || metricName.includes('bytes')) return 'gauge';
  return 'gauge';
};

// Suggest appropriate aggregation based on metric type
const getDefaultAggregation = (metricName: string): string => {
  const type = getMetricType(metricName);
  if (type === 'counter') return 'rate'; // For counters like http_requests_total
  if (type === 'histogram') return 'avg'; // For duration metrics
  return 'avg'; // Default for gauges
};

export const QueryBuilder = ({ queries, metrics, onAddQuery, onUpdateQuery, onRemoveQuery }: QueryBuilderProps) => {
  const categorizedMetrics = {
    system: metrics.filter(m => m.startsWith('system.')),
    http: metrics.filter(m => m.startsWith('http_')),
    application: metrics.filter(m => m.startsWith('application.')),
    database: metrics.filter(m => m.startsWith('database.'))
  };

  return (
    <div className="w-72 bg-white rounded border border-gray-200 p-3 shadow-sm h-fit">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Queries</h3>
        <button
          onClick={onAddQuery}
          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1 text-xs transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {queries.map((query, index) => (
          <div key={query.id} className="p-3 bg-gray-50 rounded border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                  index === 0 ? 'bg-blue-100 text-blue-700' :
                  index === 1 ? 'bg-green-100 text-green-700' :
                  index === 2 ? 'bg-purple-100 text-purple-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  Query {String.fromCharCode(65 + index)}
                </span>
                {query.metric && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-1 py-0.5 rounded">
                    {getMetricType(query.metric)}
                  </span>
                )}
              </div>
              {queries.length > 1 && (
                <button
                  onClick={() => onRemoveQuery(query.id)}
                  className="text-gray-400 hover:text-red-500 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Metric</label>
                <select
                  value={query.metric}
                  onChange={(e) => {
                    const newMetric = e.target.value;
                    const defaultAgg = getDefaultAggregation(newMetric);
                    onUpdateQuery(query.id, { 
                      metric: newMetric,
                      aggregation: defaultAgg
                    });
                  }}
                  className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                >
                  <option value="">Select metric</option>
                  {categorizedMetrics.system.length > 0 && (
                    <optgroup label="System Metrics">
                      {categorizedMetrics.system.map((metric) => (
                        <option key={metric} value={metric}>
                          {metric}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {categorizedMetrics.http.length > 0 && (
                    <optgroup label="HTTP Metrics">
                      {categorizedMetrics.http.map((metric) => (
                        <option key={metric} value={metric}>
                          {metric}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {categorizedMetrics.application.length > 0 && (
                    <optgroup label="Application Metrics">
                      {categorizedMetrics.application.map((metric) => (
                        <option key={metric} value={metric}>
                          {metric}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {categorizedMetrics.database.length > 0 && (
                    <optgroup label="Database Metrics">
                      {categorizedMetrics.database.map((metric) => (
                        <option key={metric} value={metric}>
                          {metric}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Aggregation</label>
                  <select
                    value={query.aggregation}
                    onChange={(e) => onUpdateQuery(query.id, { aggregation: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    {aggregations.map((agg) => (
                      <option key={agg} value={agg}>
                        {agg}
                        {agg === 'rate' && query.metric.includes('_total') ? ' (recommended)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Group by</label>
                  <select
                    value={query.groupBy}
                    onChange={(e) => onUpdateQuery(query.id, { groupBy: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    {groupByOptions.map((option) => (
                      <option 
                        key={option} 
                        value={option}
                        disabled={!query.metric.startsWith('http_') && ['method', 'route', 'status_code', 'status_class'].includes(option)}
                      >
                        {option}
                        {query.metric.startsWith('http_') && ['method', 'route', 'status_code'].includes(option) ? ' (HTTP)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Show helpful info for HTTP metrics */}
              {query.metric === 'http_requests_total' && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 This counter tracks total HTTP requests. Use 'rate' aggregation to see requests/second.
                  Group by 'method', 'route', or 'status_code' for detailed breakdown.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Display Options */}
      <div className="mt-6 pt-3 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Display Options</h4>
        
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Chart Type</label>
            <select className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs">
              <option>Line</option>
              <option>Area</option>
              <option>Bar</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Show Legend</label>
            <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-gray-300" />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Fill Area</label>
            <input type="checkbox" className="w-3 h-3 rounded border-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};
