import { useState } from 'react';
import { Clock, Activity, Database, Server } from 'lucide-react';

import { PageHeader } from '@/components/common/PageHeader';
import { QuickActions } from '@/components/common/QuickActions';
import { SearchInput } from '@/components/common/SearchInput';
import { StatCard } from '@/components/common/StatCard';
import { QueryBuilder } from '@/components/common/QueryBuilder';
import { Query } from '@/components/common/utils';
import { HttpMetricsChart } from '@/components/common/HttpChart';
import { useMetrics } from '@/hooks/useMetrics';

export type MetricType = 'counter' | 'histogram' | 'gauge';

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

  const { metrics: telemetryMetrics, isLoading, error, refreshData } = useMetrics(autoRefresh);

  // Enhanced metrics list including HTTP metrics
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
    
    // HTTP metrics (from OpenTelemetry data)
    'http_requests_total',
    'http_request_duration',
    'http_response_size',
    
    // Database metrics
    'database.connections.active',
    'database.query.duration',
    'database.pool.size'
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
    refreshData();
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
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
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
          <QueryBuilder
            queries={queries}
            metrics={filteredMetrics}
            onAddQuery={addQuery}
            onUpdateQuery={updateQuery}
            onRemoveQuery={removeQuery}
          />

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
                <HttpMetricsChart queries={queries} timeRange={timeRange} />
              </div>
            </div>

            {/* Quick Actions for HTTP Metrics */}
            <QuickActions onSetQueries={setQueries} />
          </div>
        </div>
      </div>
    </div>
  );
}