import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, Play, Pause, RotateCcw, Download, Settings, ChevronDown } from 'lucide-react';
import MetricCatalog from '@/components/monitoring/MetricCatalog';
import { useMetrics } from '@/hooks/useMetrics';
import { OtelMetric } from '@iot-sphere/entity-lib';

export function MetricExplorer() {
  // Use your real SSE business logic
  const { metrics, isLoading, error, refreshData } = useMetrics(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('15m');
  const [isLive, setIsLive] = useState(true);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [showFilters, setShowFilters] = useState(false);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Compact Top Bar - Datadog Style */}
      <div className="border-b border-gray-200 bg-white">
        {/* Main Controls Row */}
        <div className="flex items-center gap-1.5 px-4 py-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 pl-8 pr-3 text-xs border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 h-7 px-2.5 text-xs rounded-sm border transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="h-3 w-3" />
            Filters
          </button>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-7 px-2.5 text-xs border border-gray-200 rounded-sm bg-gray-50 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="5m">Past 5 minutes</option>
            <option value="15m">Past 15 minutes</option>
            <option value="1h">Past hour</option>
            <option value="6h">Past 6 hours</option>
            <option value="1d">Past day</option>
          </select>

          {/* Live/Pause Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1 h-7 px-2.5 text-xs rounded-sm border transition-colors ${
              isLive 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isLive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isLive ? 'Live' : 'Paused'}
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 h-7 px-2.5 text-xs rounded-sm border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <RotateCcw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export */}
          <button className="flex items-center gap-1 h-7 px-2.5 text-xs rounded-sm border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
            <Download className="h-3 w-3" />
            Export
          </button>
        </div>

        {/* Filters Panel (Collapsible) */}
        {showFilters && (
          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500">Quick filters:</span>
              <button className="h-6 px-2 bg-white border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 text-xs">
                type:counter
              </button>
              <button className="h-6 px-2 bg-white border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 text-xs">
                unit:ms
              </button>
              <button className="h-6 px-2 bg-white border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 text-xs">
                name:http_*
              </button>
              <button className="text-xs text-blue-600 hover:text-blue-700">+ Add Filter</button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Compact */}
      <div className="flex-1 overflow-auto p-4">
        <MetricCatalog
          metrics={metrics}
          searchQuery={searchQuery}
          error={error}
        />
      </div>
    </div>
  );
}