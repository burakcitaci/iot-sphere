import { useState, useCallback } from 'react';
import { Clock, Activity, Database, Server } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatCard } from '@/components/common/StatCard';
import { useSpans } from '@/hooks/useSpans';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/common/StatusBadge';

const formatHrTime = (hrTime: [number, number]): string => {
  const [seconds, nanos] = hrTime;
  const date = new Date(seconds * 1000 + nanos / 1_000_000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Europe/Berlin'
  });
};

const formatDuration = (startTime: [number, number], endTime: [number, number]): string => {
  const [startSec, startNano] = startTime;
  const [endSec, endNano] = endTime;
  const durationMs = (endSec - startSec) * 1000 + (endNano - startNano) / 1_000_000;
  return `${durationMs.toFixed(2)}ms`;
};

export function TraceExplorer() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const { spans, isLoading, error, refreshData } = useSpans(autoRefresh);

  const handleRefresh = useCallback(() => refreshData(), [refreshData]);

  const stats = {
    totalSpans: spans.length,
    avgDuration: spans.length > 0 
      ? spans.reduce((acc, span) => {
          const [startSec, startNano] = span.startTime;
          const [endSec, endNano] = span.endTime;
          return acc + ((endSec - startSec) * 1000 + (endNano - startNano) / 1_000_000);
        }, 0) / spans.length
      : 0,
    errorRate: spans.length > 0 
      ? (spans.filter(span => span.status?.code === 2).length / spans.length * 100).toFixed(1)
      : 0,
    uniqueServices: new Set(spans.map(span => span.attributes['service.name'] as string)).size
  };

  const filteredSpans = spans.filter(span => {
    const searchLower = searchQuery.toLowerCase();
    return (
      span.name.toLowerCase().includes(searchLower) ||
      span.attributes['code.function']?.toString().toLowerCase().includes(searchLower) ||
      span.attributes['code.namespace']?.toString().toLowerCase().includes(searchLower) ||
      span.spanContext.traceId.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Trace Explorer"
          description="Monitor and analyze your application traces"
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          onRefresh={handleRefresh}
        />

        {/* Stats Bar */}
        <div className="flex gap-3 mb-3">
          <StatCard
            title="Total Spans"
            value={stats.totalSpans.toString()}
            icon={Database}
            description="Last 15 minutes"
          />
          <StatCard
            title="Avg Duration"
            value={`${stats.avgDuration.toFixed(2)}ms`}
            icon={Clock}
            description="Average span duration"
          />
          <StatCard
            title="Error Rate"
            value={`${stats.errorRate}%`}
            icon={Activity}
            description="Failed spans"
          />
          <StatCard
            title="Services"
            value={stats.uniqueServices.toString()}
            icon={Server}
            description="Unique services"
          />
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded border border-gray-200 p-3 mb-3 shadow-sm">
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Search traces..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="flex-grow"
            />
            <button className="flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-800 rounded px-3 py-1.5 text-xs hover:bg-gray-200 transition-colors">
              <Clock className="h-3 w-3" />
              Last 15 minutes
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-4">
          {/* Filters Sidebar */}
          <div className="w-64 bg-white rounded border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Filters</h3>

            {/* Services Filter */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Services</span>
                {/* Up arrow placeholder */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" className="h-4 w-4 text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path></svg>
              </div>
              {/* Search input placeholder */}
              <div className="relative mb-2">
                <input type="text" placeholder="Search services..." className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
              </div>
              {/* Service list placeholder */}
              <div className="space-y-1 text-xs text-gray-700">
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    service-name (count)
                  </label>
                </div>
              </div>
            </div>

            {/* Duration Filter */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Duration</span>
                {/* Up arrow placeholder */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" className="h-4 w-4 text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path></svg>
              </div>
              <div className="space-y-1 text-xs text-gray-700">
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    &lt; 100ms
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    100ms - 1s
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    &gt; 1s
                  </label>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Status</span>
                {/* Up arrow placeholder */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" className="h-4 w-4 text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path></svg>
              </div>
              <div className="space-y-1 text-xs text-gray-700">
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Success (2xx)
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Error (4xx, 5xx)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Traces Table */}
          <div className="flex-grow bg-white rounded border border-gray-200 shadow-sm">
            <div className="px-3 py-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                Traces ({filteredSpans.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading traces...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                Error loading traces: {error.message}
              </div>
            ) : filteredSpans.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No traces found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                      Timestamp
                    </TableHead>
                    <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                      Service
                    </TableHead>
                    <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                      Name
                    </TableHead>
                    <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                      Resource
                    </TableHead>
                    <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                      Duration
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSpans.map((span) => (
                    <TableRow
                      key={span.spanContext.spanId}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <TableCell className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={span.status.code === 1 ? 'Completed' : 'Error'} />
                          <span className="text-sm text-gray-500">
                            {formatHrTime(span.startTime)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2 whitespace-nowrap text-xs">
                        <span className="text-sm text-gray-800">
                          {span.attributes['service.name'] as string}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-gray-900">
                        {span.name}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">{span.attributes['code.function'] as string}</span>
                          <span className="text-gray-500">{span.attributes['code.namespace'] as string}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2 whitespace-nowrap text-xs">
                        <span className={span.status.code === 2 ? 'text-red-600' : 'text-gray-900'}>
                          {formatDuration(span.startTime, span.endTime)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}