import { useState } from 'react';
import { Clock, Search, Filter, Plus, Activity, Database, Server } from 'lucide-react';

// Type definitions
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

interface PageHeaderProps {
  title: string;
  description: string;
  autoRefresh: boolean;
  onAutoRefreshChange: (value: boolean) => void;
  onRefresh: () => void;
}

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

type MetricType = 'counter' | 'histogram' | 'gauge';

// Mock MetricsChart component since it's imported
const MetricsChart: React.FC<MetricsChartProps> = ({ queries, timeRange }) => (
  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
    <div className="text-center text-gray-500">
      <Activity className="h-8 w-8 mx-auto mb-2" />
      <p className="text-sm">Chart visualization for {queries.length} queries</p>
      <p className="text-xs text-gray-400">Time range: {timeRange}</p>
    </div>
  </div>
);

// Mock components
const PageHeader: React.FC<PageHeaderProps> = ({ title, description, autoRefresh, onAutoRefreshChange, onRefresh }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => onAutoRefreshChange(e.target.checked)}
            className="rounded"
          />
          Auto-refresh
        </label>
        <button
          onClick={onRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  </div>
);

const SearchInput: React.FC<SearchInputProps> = ({ placeholder, value, onChange, className }) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm"
    />
  </div>
);

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
  <div className="bg-white border border-gray-200 rounded p-3 shadow-sm">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-blue-500" />
      <div>
        <p className="text-xs text-gray-600">{title}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

export function MetricExplorer() {
  const [timeRange, setTimeRange] = useState<string>('15m');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [queries, setQueries] = useState<Query[]>([
    {
      id: 1,
      metric: 'system.cpu.user',
      aggregation: 'avg',
      groupBy: 'everything',
      filters: []
    }
  ]);

  // Enhanced metrics list including your HTTP metric
  const metrics = [
    // System metrics
    'system.cpu.user',
    'system.cpu.system', 
    'system.memory.used',
    'system.memory.free',
    'system.disk.used',
    'system.network.bytes_sent',
    'system.network.bytes_rcvd',
    
    // Application metrics
    'application.requests.rate',
    'application.response.time',
    
    // HTTP metrics (from your OpenTelemetry data)
    'http_requests_total',
    'http_request_duration',
    'http_response_size',
    
    // Database metrics
    'database.connections.active',
    'database.query.duration',
    'database.pool.size'
  ];

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

  const addQuery = (): void => {
    const newQuery: Query = {
      id: Date.now(),
      metric: '',
      aggregation: 'avg',
      groupBy: 'everything',
      filters: []
    };
    setQueries([...queries, newQuery]);
  };

  const updateQuery = (id: number, updates: Partial<Query>): void => {
    setQueries(queries.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuery = (id: number): void => {
    setQueries(queries.filter(q => q.id !== id));
  };

  const handleRefresh = (): void => {
    console.log('Refreshing metrics...');
  };

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

  const filteredMetrics: string[] = metrics.filter(metric =>
    metric.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Metrics Explorer"
          description="Monitor and analyze your application metrics including HTTP requests"
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          onRefresh={handleRefresh}
        />

        {/* Stats Bar */}
        <div className="flex gap-3 mb-3">
          <StatCard
            title="Active Queries"
            value={queries.length.toString()}
            icon={Activity}
          />
          <StatCard
            title="Time Range"
            value={timeRange}
            icon={Clock}
          />
          <StatCard
            title="Metrics Available"
            value={metrics.length.toString()}
            icon={Database}
          />
          <StatCard
            title="HTTP Metrics"
            value={metrics.filter(m => m.startsWith('http_')).length.toString()}
            icon={Server}
          />
        </div>

        {/* Top Search and Controls */}
        <div className="bg-white rounded border border-gray-200 p-3 mb-3 shadow-sm">
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Search metrics (try 'http' or 'cpu')..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="flex-grow"
            />
            <button className="flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-800 rounded px-3 py-1.5 text-xs hover:bg-gray-200 transition-colors">
              <Filter className="h-3 w-3" />
              Filter
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-100 border border-gray-200 text-gray-800 rounded px-3 py-1.5 text-xs hover:bg-gray-200 transition-colors"
            >
              <option value="5m">Last 5 minutes</option>
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last hour</option>
              <option value="3h">Last 3 hours</option>
              <option value="6h">Last 6 hours</option>
              <option value="12h">Last 12 hours</option>
              <option value="1d">Last day</option>
              <option value="7d">Last 7 days</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-3">
          {/* Left Sidebar - Query Builder */}
          <div className="w-72 bg-white rounded border border-gray-200 p-3 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Queries</h3>
              <button
                onClick={addQuery}
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
                        onClick={() => removeQuery(query.id)}
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
                          updateQuery(query.id, { 
                            metric: newMetric,
                            aggregation: defaultAgg
                          });
                        }}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="">Select metric</option>
                        <optgroup label="System Metrics">
                          {filteredMetrics.filter(m => m.startsWith('system.')).map((metric) => (
                            <option key={metric} value={metric}>
                              {metric}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="HTTP Metrics">
                          {filteredMetrics.filter(m => m.startsWith('http_')).map((metric) => (
                            <option key={metric} value={metric}>
                              {metric}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Application Metrics">
                          {filteredMetrics.filter(m => m.startsWith('application.')).map((metric) => (
                            <option key={metric} value={metric}>
                              {metric}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Database Metrics">
                          {filteredMetrics.filter(m => m.startsWith('database.')).map((metric) => (
                            <option key={metric} value={metric}>
                              {metric}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Aggregation</label>
                        <select
                          value={query.aggregation}
                          onChange={(e) => updateQuery(query.id, { aggregation: e.target.value })}
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
                          onChange={(e) => updateQuery(query.id, { groupBy: e.target.value })}
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

          {/* Right Main Area - Chart */}
          <div className="flex-1">
            <div className="bg-white rounded border border-gray-200 shadow-sm">
              <div className="px-3 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  {queries[0]?.metric ? `${queries[0].aggregation}:${queries[0].metric}(*)` : 'No metrics selected'}
                  {queries[0]?.groupBy !== 'everything' && ` by ${queries[0].groupBy}`}
                </h3>
              </div>
              <div className="p-4">
                <MetricsChart queries={queries} timeRange={timeRange} />
              </div>
            </div>

            {/* Quick Actions for HTTP Metrics */}
            <div className="mt-3 bg-white rounded border border-gray-200 p-3 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick HTTP Metric Queries</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setQueries([{
                    id: Date.now(),
                    metric: 'http_requests_total',
                    aggregation: 'rate',
                    groupBy: 'method',
                    filters: []
                  }])}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200"
                >
                  Request Rate by Method
                </button>
                <button
                  onClick={() => setQueries([{
                    id: Date.now(),
                    metric: 'http_requests_total',
                    aggregation: 'rate',
                    groupBy: 'status_code',
                    filters: []
                  }])}
                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200"
                >
                  Request Rate by Status
                </button>
                <button
                  onClick={() => setQueries([{
                    id: Date.now(),
                    metric: 'http_requests_total',
                    aggregation: 'rate',
                    groupBy: 'route',
                    filters: []
                  }])}
                  className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200"
                >
                  Request Rate by Route
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}