import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Table as TableIcon, 
  PieChart as PieChartIcon,
  Download,
  Maximize,
  Activity,
  XCircle,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { QueryType } from './UnifiedQueryBuilder';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface DataPoint {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  service: string;
  message: string;
  traceId?: string;
  spanId?: string;
  metadata?: Record<string, any>;
}

export interface TraceSpan {
  id: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  service: string;
  startTime: string;
  duration: number;
  status: 'OK' | 'ERROR' | 'TIMEOUT';
  tags?: Record<string, any>;
}

export interface MetricData {
  name: string;
  data: DataPoint[];
  unit?: string;
  aggregation?: string;
}

export interface UnifiedDataProps {
  type: QueryType;
  data: LogEntry[] | TraceSpan[] | MetricData[];
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  className?: string;
  stats?: React.ReactNode;
}

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316'];

const getLevelColor = (level: string) => {
  switch (level) {
    case 'ERROR':
    case 'FATAL':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'WARN':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'INFO':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'DEBUG':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OK':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ERROR':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'TIMEOUT':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
};

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

interface FacetGroupProps {
  title: string;
  data: Array<[string, number]>;
  onFilterChange: (facet: string, value: string, isSelected: boolean) => void;
  initiallyOpen?: boolean;
}

const FacetGroup: React.FC<FacetGroupProps> = ({ title, data, onFilterChange, initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [filter, setFilter] = useState('');

  const filteredData = data.filter(([key]: [string, number]) => key.toLowerCase().includes(filter.toLowerCase()));

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-1 text-sm font-medium text-gray-700 p-1 rounded-sm hover:bg-gray-100">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span>{title}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 pr-2 py-1">
        <input
          type="text"
          placeholder={`Filter ${title}...`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full h-7 px-2 mb-1 text-xs border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="max-h-40 overflow-y-auto space-y-0.5">
          {filteredData.map(([key, value]: [string, number]) => (
            <div key={key} className="flex items-center justify-between text-sm p-1 rounded-sm hover:bg-gray-50">
                <div className="flex items-center">
                    <Checkbox id={`${title}-${key}`} className="mr-2" onCheckedChange={(checked) => onFilterChange(title, key, !!checked)} />
                    <label htmlFor={`${title}-${key}`} className="text-gray-600 truncate cursor-pointer">{key}</label>
                </div>
              <span className="text-gray-500 text-xs">{value}</span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export const UnifiedDataVisualization: React.FC<UnifiedDataProps> = ({
  type,
  data,
  isLoading = false,
  error,
  onRefresh,
  className,
  stats
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'summary'>('chart');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});

  const handleFilterChange = (facet: string, value: string, isSelected: boolean) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (!newFilters[facet]) {
        newFilters[facet] = new Set();
      }
      if (isSelected) {
        newFilters[facet].add(value);
      } else {
        newFilters[facet].delete(value);
      }
      if (newFilters[facet].size === 0) {
        delete newFilters[facet];
      }
      return newFilters;
    });
  };

  const logFacets = useMemo(() => {
    if (type !== 'logs' || !Array.isArray(data)) {
      return { services: [], levels: [], hosts: [], environments: [] };
    }

    const logData = data as LogEntry[];
    const services = new Map<string, number>();
    const levels = new Map<string, number>();
    const hosts = new Map<string, number>();
    const environments = new Map<string, number>();

    logData.forEach(log => {
      services.set(log.service, (services.get(log.service) || 0) + 1);
      levels.set(log.level, (levels.get(log.level) || 0) + 1);
      const host = log.metadata?.host || 'unknown';
      hosts.set(host, (hosts.get(host) || 0) + 1);
      const env = log.metadata?.environment || 'unknown';
      environments.set(env, (environments.get(env) || 0) + 1);
    });

    return {
      services: Array.from(services.entries()).sort((a, b) => b[1] - a[1]),
      levels: Array.from(levels.entries()).sort((a, b) => b[1] - a[1]),
      hosts: Array.from(hosts.entries()).sort((a, b) => b[1] - a[1]),
      environments: Array.from(environments.entries()).sort((a, b) => b[1] - a[1])
    };
  }, [data, type]);

  const traceFacets = useMemo(() => {
    if (type !== 'traces' || !Array.isArray(data)) {
      return { services: [], operationNames: [], statuses: [] };
    }

    const traceData = data as TraceSpan[];
    const services = new Map<string, number>();
    const operationNames = new Map<string, number>();
    const statuses = new Map<string, number>();

    traceData.forEach(span => {
      services.set(span.service, (services.get(span.service) || 0) + 1);
      operationNames.set(span.operationName, (operationNames.get(span.operationName) || 0) + 1);
      statuses.set(span.status, (statuses.get(span.status) || 0) + 1);
    });

    return {
      services: Array.from(services.entries()).sort((a, b) => b[1] - a[1]),
      operationNames: Array.from(operationNames.entries()).sort((a, b) => b[1] - a[1]),
      statuses: Array.from(statuses.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [data, type]);

  const filteredLogData = useMemo(() => {
    if (type !== 'logs' || Object.keys(filters).length === 0) {
      return data as LogEntry[];
    }
    const logData = data as LogEntry[];

    return logData.filter(log => {
      return Object.entries(filters).every(([facet, values]) => {
        const setOfValues = values as Set<string>;
        if (facet.toLowerCase() === 'service') {
          return setOfValues.has(log.service);
        }
        if (facet.toLowerCase() === 'status') {
          return setOfValues.has(log.level);
        }
        if (facet.toLowerCase() === 'host') {
          return setOfValues.has(log.metadata?.host);
        }
        // Add more filter logic here
        return true;
      });
    });
  }, [data, type, filters]);

  const filteredTraceData = useMemo(() => {
    if (type !== 'traces' || Object.keys(filters).length === 0) {
      return data as TraceSpan[];
    }
    const traceData = data as TraceSpan[];

    return traceData.filter(span => {
      return Object.entries(filters).every(([facet, values]) => {
        const setOfValues = values as Set<string>;
        if (facet.toLowerCase() === 'service') {
          return setOfValues.has(span.service);
        }
        if (facet.toLowerCase() === 'operation name') {
          return setOfValues.has(span.operationName);
        }
        if (facet.toLowerCase() === 'status') {
          return setOfValues.has(span.status);
        }
        return true;
      });
    });
  }, [data, type, filters]);

  const chartData = useMemo(() => {
    if (type === 'metrics' && Array.isArray(data)) {
      const metricData = data as MetricData[];
      if (metricData.length > 0 && metricData[0].data) {
        return metricData[0].data.map(point => ({
          time: formatTimestamp(point.timestamp),
          value: point.value,
          label: point.label
        }));
      }
    } else if (type === 'logs') {
      const logData = filteredLogData;
      const groupedByTime = logData.reduce((acc, log) => {
        const timeKey = new Date(log.timestamp).toISOString().slice(0, 16);
        if (!acc[timeKey]) {
          acc[timeKey] = { time: timeKey, total: 0, error: 0, warn: 0, info: 0, debug: 0 };
        }
        acc[timeKey].total++;
        acc[timeKey][log.level.toLowerCase()]++;
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(groupedByTime).sort((a: any, b: any) => 
        new Date(a.time).getTime() - new Date(b.time).getTime()
      );
    } else if (type === 'traces') {
      const traceData = filteredTraceData;
      const groupedByTime = traceData.reduce((acc, span) => {
        const timeKey = new Date(span.startTime).toISOString().slice(0, 16);
        if (!acc[timeKey]) {
          acc[timeKey] = { time: timeKey, total: 0, avgDuration: 0, errors: 0 };
        }
        acc[timeKey].total++;
        acc[timeKey].avgDuration = (acc[timeKey].avgDuration + span.duration) / 2;
        if (span.status === 'ERROR') acc[timeKey].errors++;
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(groupedByTime).sort((a: any, b: any) => 
        new Date(a.time).getTime() - new Date(b.time).getTime()
      );
    }
    return [];
  }, [data, type, filteredLogData, filteredTraceData]);

  const summaryStats = useMemo(() => {
    if (type === 'logs') {
      const logData = data as LogEntry[];
      const levelCounts = logData.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        total: logData.length,
        details: Object.entries(levelCounts).map(([level, count]) => ({ level, count }))
      }
    } else if (type === 'traces') {
      const traceData = data as TraceSpan[];
      const statusCounts = traceData.reduce((acc, span) => {
        acc[span.status] = (acc[span.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: traceData.length,
        details: Object.entries(statusCounts).map(([status, count]) => ({ level: status, count }))
      }
    } else if (type === 'metrics') {
      const metricData = data as MetricData[];
      if (metricData.length > 0 && metricData[0].data) {
        return {
          total: metricData[0].data.length,
          details: [
            { level: 'Name', value: metricData[0].name },
            { level: 'Unit', value: metricData[0].unit },
            { level: 'Points', value: metricData[0].data.length },
          ]
        }
      }
    }
    return { total: 0, details: [] };
  }, [data, type]);

  const renderChart = () => {
    if (type === 'metrics') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      );
    } else if (type === 'logs') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="error" stackId="a" fill="#EF4444" />
            <Bar dataKey="warn" stackId="a" fill="#F59E0B" />
            <Bar dataKey="info" stackId="a" fill="#3B82F6" />
            <Bar dataKey="debug" stackId="a" fill="#6B7280" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (type === 'traces') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="avgDuration" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  const renderTable = () => {
    if (type === 'logs') {
      const logData = filteredLogData;
      
      return (
        <div className="flex gap-4 h-full">
          {/* Left Faceted Filter Panel */}
          <div className="w-80 flex-shrink-0 border-r border-gray-200 pr-4 overflow-y-auto">
            <div className="space-y-2">
              {/* Search Facets */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search facets"
                  className="w-full h-8 pl-8 pr-3 text-sm border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              {/* Showing count */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📝 Showing {Math.min(100, logData.length)} of {logData.length}</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm">+ Add</button>
              </div>
              
              {/* CORE Section */}
              <div className="space-y-1">
                <div className="bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 rounded-sm mb-2">
                  📁 CORE
                </div>
                
                <FacetGroup title="Service" data={logFacets.services} onFilterChange={handleFilterChange} initiallyOpen={true} />
                <FacetGroup title="Status" data={logFacets.levels} onFilterChange={handleFilterChange} />
                <FacetGroup title="Host" data={logFacets.hosts} onFilterChange={handleFilterChange} />
                <FacetGroup title="Environment" data={logFacets.environments} onFilterChange={handleFilterChange} />

              </div>
            </div>
          </div>
          
          {/* Right Table Panel */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Trace ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logData.length > 0 ? (
                  logData.slice(0, 100).map((log) => (
                    <TableRow 
                      key={log.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedItem(log)}
                    >
                      <TableCell className="font-mono text-xs">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border rounded-sm ${getLevelColor(log.level)}`}>
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.service}</TableCell>
                      <TableCell className="text-sm max-w-md truncate">{log.message}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {log.traceId?.slice(0, 8)}...
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center">
                        <TableIcon className="h-8 w-8 mb-2 opacity-50" />
                        <p>No log data available</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {error ? 'Connection error - check your log stream' : 'Waiting for log data...'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    } else if (type === 'traces') {
      const traceData = filteredTraceData;
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start Time</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trace ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {traceData.slice(0, 100).map((span) => (
              <TableRow 
                key={span.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedItem(span)}
              >
                <TableCell className="font-mono text-xs">
                  {formatTimestamp(span.startTime)}
                </TableCell>
                <TableCell className="text-sm">{span.service}</TableCell>
                <TableCell className="text-sm">{span.operationName}</TableCell>
                <TableCell className="font-mono text-xs">
                  {formatDuration(span.duration)}
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs border rounded-sm ${getStatusColor(span.status)}`}>
                    {span.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500">
                  {span.traceId.slice(0, 8)}...
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    return null;
  };

  if (type === 'metrics') {
    // Basic rendering for non-log types for now
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Visualization for {type} is not customized yet.</p>
        </CardContent>
      </Card>
    );
  }

  const isLogs = type === 'logs';
  const traceData = isLogs ? [] : filteredTraceData;
  const logData = isLogs ? filteredLogData : [];

  return (
    <div className="flex gap-4 h-full w-full items-start">
      {/* Facets Card */}
      <Card className="w-80 flex-shrink-0 flex flex-col px-2 py-3 rounded-sm bg-transparent shadow-none border gap-1">
        <CardHeader className="p-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search facets"
              className="w-full h-8 pl-8 pr-3 text-sm border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Showing {data.length} of {data.length}</span>
            <button className="text-blue-600 hover:text-blue-700 text-sm">+ Add</button>
          </div>
          <div className="space-y-1">
            <div className="bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 rounded-sm mb-1">
              CORE
            </div>
            {isLogs ? (
              <>
                <FacetGroup title="Service" data={logFacets.services} onFilterChange={handleFilterChange} initiallyOpen={true} />
                <FacetGroup title="Status" data={logFacets.levels} onFilterChange={handleFilterChange} />
                <FacetGroup title="Host" data={logFacets.hosts} onFilterChange={handleFilterChange} />
                <FacetGroup title="Environment" data={logFacets.environments} onFilterChange={handleFilterChange} />
              </>
            ) : (
              <>
                <FacetGroup title="Service" data={traceFacets.services} onFilterChange={handleFilterChange} initiallyOpen={true} />
                <FacetGroup title="Operation Name" data={traceFacets.operationNames} onFilterChange={handleFilterChange} />
                <FacetGroup title="Status" data={traceFacets.statuses} onFilterChange={handleFilterChange} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="flex-1 flex flex-col rounded-sm bg-transparent shadow-none border">
        <CardHeader className="p-0">
          {stats && (
            <div className="border-b">
              <div className="px-6 py-1">{stats}</div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading {type} data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                {onRefresh && (
                  <Button onClick={onRefresh} variant="outline">
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-auto h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Trace ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLogs ? (
                    logData.length > 0 ? (
                      logData.slice(0, 100).map((log) => (
                        <TableRow 
                          key={log.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedItem(log)}
                        >
                          <TableCell className="font-mono text-xs">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs border rounded-sm ${getLevelColor(log.level)}`}>
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.service}</TableCell>
                          <TableCell className="text-sm max-w-md truncate">{log.message}</TableCell>
                          <TableCell className="font-mono text-xs text-gray-500">
                            {log.traceId?.slice(0, 8)}...
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-96 text-center py-8 text-gray-500">
                          <div className="flex flex-col items-center">
                            <TableIcon className="h-8 w-8 mb-2 opacity-50" />
                            <p>No log data available</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {Object.keys(filters).length > 0 ? 'No results match your filter' : 'Waiting for log data...'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    traceData.length > 0 ? (
                      traceData.slice(0, 100).map((span) => (
                        <TableRow 
                          key={span.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedItem(span)}
                        >
                          <TableCell className="font-mono text-xs">
                            {formatTimestamp(span.startTime)}
                          </TableCell>
                          <TableCell className="text-sm">{span.service}</TableCell>
                          <TableCell className="text-sm">{span.operationName}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {formatDuration(span.duration)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs border rounded-sm ${getStatusColor(span.status)}`}>
                              {span.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-500">
                            {span.traceId.slice(0, 8)}...
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-96 text-center py-8 text-gray-500">
                          <div className="flex flex-col items-center">
                            <TableIcon className="h-8 w-8 mb-2 opacity-50" />
                            <p>No trace data available</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {Object.keys(filters).length > 0 ? 'No results match your filter' : 'Waiting for trace data...'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 