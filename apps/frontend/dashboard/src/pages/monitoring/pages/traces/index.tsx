import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, Play, Pause, RotateCcw, Download, Settings, ChevronDown } from 'lucide-react';
import { UnifiedDataVisualization, TraceSpan } from '@/components/monitoring/UnifiedDataVisualization';
import { useSpans } from '@/hooks/useSpans';
import { OtelSpan } from '@iot-sphere/entity-lib';

export function TraceExplorer() {
  // Use your real SSE business logic
  const { spans, isLoading, error, refreshData } = useSpans(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('15m');
  const [isLive, setIsLive] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Transform OtelSpan data to TraceSpan format for the UI
  const traceData = useMemo((): TraceSpan[] => {
    return spans.map((span: OtelSpan, index: number) => {
      // Calculate duration in milliseconds from hrTime format
      const startMs = span.startTime[0] * 1000 + Math.floor(span.startTime[1] / 1_000_000);
      const endMs = span.endTime[0] * 1000 + Math.floor(span.endTime[1] / 1_000_000);
      const duration = endMs - startMs;

      return {
        id: span.spanContext.spanId || `span-${index}`,
        traceId: span.spanContext.traceId || 'unknown-trace',
        spanId: span.spanContext.spanId || 'unknown-span',
        parentSpanId: undefined, // OtelSpan doesn't have parentSpanId in the interface
        operationName: span.name,
        service: span.serviceName,
        startTime: new Date(startMs).toISOString(),
        duration,
        status: span.status?.code === 1 ? 'OK' : span.status?.code === 2 ? 'ERROR' : 'TIMEOUT',
        tags: {
          ...span.attributes,
          'service.version': span.serviceVersion,
          ...(span.status?.message && { 'status.message': span.status.message })
        }
      };
    });
  }, [spans]);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const filteredTraces = useMemo(() => {
    if (!searchQuery) return traceData;
    return traceData.filter(trace => 
      trace.operationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trace.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trace.traceId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [traceData, searchQuery]);

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
              placeholder="Search for traces..."
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

          {/* View Mode Toggle */}
          <div className="flex h-7 border border-gray-200 rounded-sm overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 text-xs transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 text-xs transition-colors border-l border-gray-200 ${
                viewMode === 'table' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Table
            </button>
          </div>

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
                service:*
              </button>
              <button className="h-6 px-2 bg-white border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 text-xs">
                status:ERROR
              </button>
              <button className="h-6 px-2 bg-white border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 text-xs">
                duration:&gt;100ms
              </button>
              <button className="text-xs text-blue-600 hover:text-blue-700">+ Add Filter</button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Compact */}
      <div className="flex-1 overflow-auto p-4">
        <UnifiedDataVisualization
          type="traces"
          data={filteredTraces}
          isLoading={isLoading}
          error={error?.message}
          onRefresh={handleRefresh}
          className="h-full"
          stats={
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-3">
                <span>{filteredTraces.length.toLocaleString()} traces found</span>
                <span className="text-gray-400">•</span>
                <span>Showing {Math.min(100, filteredTraces.length)} of {filteredTraces.length}</span>
                {/* {error && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-red-600">{error.message}</span>
                  </>
                )} */}
              </div>
              <div className="flex items-center gap-2">
                <span>Group by:</span>
                <select className="h-5 text-xs border-none bg-transparent text-gray-600 focus:outline-none">
                  <option>None</option>
                  <option>Service</option>
                  <option>Operation</option>
                  <option>Status</option>
                </select>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}