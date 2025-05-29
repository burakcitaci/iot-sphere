import { useState } from 'react';
import { Clock, Search, Filter, Plus, Activity, Database, Server } from 'lucide-react';

import { MetricsChart } from '@/components/metrics-chart';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatCard } from '@/components/common/StatCard';

export const MetricExplorer = () => {
  const [timeRange, setTimeRange] = useState('15m');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [queries, setQueries] = useState([
    {
      id: 1,
      metric: 'system.cpu.user',
      aggregation: 'avg',
      groupBy: 'everything',
      filters: []
    }
  ]);

  const metrics = [
    'system.cpu.user',
    'system.cpu.system', 
    'system.memory.used',
    'system.memory.free',
    'system.disk.used',
    'system.network.bytes_sent',
    'system.network.bytes_rcvd',
    'application.requests.rate',
    'application.response.time',
    'database.connections.active'
  ];

  const aggregations = ['avg', 'sum', 'min', 'max', 'count', 'rate'];
  const groupByOptions = ['everything', 'host', 'service', 'environment', 'region'];

  const addQuery = () => {
    const newQuery = {
      id: Date.now(),
      metric: '',
      aggregation: 'avg',
      groupBy: 'everything',
      filters: []
    };
    setQueries([...queries, newQuery]);
  };

  const updateQuery = (id: number, updates: any) => {
    setQueries(queries.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuery = (id: number) => {
    setQueries(queries.filter(q => q.id !== id));
  };

  const handleRefresh = () => {
    // Mock refresh functionality
    console.log('Refreshing metrics...');
  };

  const filteredMetrics = metrics.filter(metric =>
    metric.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Metrics Explorer"
          description="Monitor and analyze your application metrics"
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
        </div>

        {/* Top Search and Controls */}
        <div className="bg-white rounded border border-gray-200 p-3 mb-3 shadow-sm">
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Search metrics..."
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
          <div className="w-60 bg-white rounded border border-gray-200 p-3 shadow-sm h-fit">
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
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                      index === 0 ? 'bg-blue-100 text-blue-700' :
                      index === 1 ? 'bg-green-100 text-green-700' :
                      index === 2 ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      Query {String.fromCharCode(65 + index)}
                    </span>
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
                        onChange={(e) => updateQuery(query.id, { metric: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="">Select metric</option>
                        {filteredMetrics.map((metric) => (
                          <option key={metric} value={metric}>
                            {metric}
                          </option>
                        ))}
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
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
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
                </h3>
              </div>
              <div className="p-4">
                <MetricsChart queries={queries} timeRange={timeRange} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};