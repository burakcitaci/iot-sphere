import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Clock, Wifi, WifiOff, RefreshCw, AlertCircle, Activity, Database } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { FilterSection } from '@/components/common/FilterSection';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { useLogs } from '@/hooks/useLogs';

// Mock data and interfaces
interface LogEntry {
  id: string;
  serviceName: string;
  severityText: string;
  body: string;
  hrTime: [number, number];
  timestamp: string;
  attributes?: Record<string, any>;
}

interface Service {
  name: string;
  count: number;
}

interface ServiceItemProps {
  service: Service;
  isSelected: boolean;
  onToggle: () => void;
}

// Mock data
const mockLogs: LogEntry[] = [
  {
    id: "log-1",
    serviceName: "coffee-house",
    severityText: "INFO",
    body: "Request completed successfully",
    hrTime: [1707314026, 797000000],
    timestamp: "Feb 7, 4:13 pm",
    attributes: { http_status: 200, method: "GET", path: "/coffeehouse" }
  },
  {
    id: "log-2",
    serviceName: "coffee-house",
    severityText: "ERROR",
    body: "Internal server error: Failed to process order",
    hrTime: [1707314025, 234000000],
    timestamp: "Feb 7, 4:12 pm",
    attributes: { http_status: 500, method: "POST", path: "/order" }
  },
  {
    id: "log-3",
    serviceName: "inventory-service",
    severityText: "INFO",
    body: "Stock check completed",
    hrTime: [1707314024, 156000000],
    timestamp: "Feb 7, 4:11 pm",
    attributes: { http_status: 200, method: "GET", path: "/stock" }
  },
  {
    id: "log-4",
    serviceName: "payment-service",
    severityText: "WARN",
    body: "Payment processing failed: Invalid card details",
    hrTime: [1707314023, 892000000],
    timestamp: "Feb 7, 4:10 pm",
    attributes: { http_status: 400, method: "POST", path: "/payment/process" }
  },
  {
    id: "log-5",
    serviceName: "auth-service",
    severityText: "DEBUG",
    body: "User authentication successful",
    hrTime: [1707314022, 678000000],
    timestamp: "Feb 7, 4:09 pm",
    attributes: { http_status: 200, method: "POST", path: "/auth/login" }
  }
];

const mockServices: Service[] = [
  { name: 'coffee-house', count: 45 },
  { name: 'inventory-service', count: 32 },
  { name: 'payment-service', count: 18 },
  { name: 'auth-service', count: 67 },
  { name: 'notification-service', count: 23 }
];

// Mock chart data - detailed histogram data
const histogramData = [
  { time: '15:29', logs: 180, errors: 8 },
  { time: '15:29:30', logs: 190, errors: 12 },
  { time: '15:30', logs: 170, errors: 5 },
  { time: '15:30:30', logs: 160, errors: 3 },
  { time: '15:31', logs: 185, errors: 9 },
  { time: '15:31:30', logs: 195, errors: 15 },
  { time: '15:32', logs: 175, errors: 7 },
  { time: '15:32:30', logs: 165, errors: 4 },
  { time: '15:33', logs: 200, errors: 18 },
  { time: '15:33:30', logs: 210, errors: 22 },
  { time: '15:34', logs: 155, errors: 2 },
  { time: '15:34:30', logs: 145, errors: 1 },
  { time: '15:35', logs: 190, errors: 11 },
  { time: '15:35:30', logs: 185, errors: 8 },
  { time: '15:36', logs: 175, errors: 6 },
  { time: '15:36:30', logs: 180, errors: 9 },
  { time: '15:37', logs: 165, errors: 4 },
  { time: '15:37:30', logs: 170, errors: 5 },
  { time: '15:38', logs: 195, errors: 13 },
  { time: '15:38:30', logs: 205, errors: 16 },
  { time: '15:39', logs: 160, errors: 3 },
  { time: '15:39:30', logs: 155, errors: 2 },
  { time: '15:40', logs: 185, errors: 10 },
  { time: '15:40:30', logs: 190, errors: 12 },
  { time: '15:41', logs: 175, errors: 7 },
  { time: '15:41:30', logs: 180, errors: 8 },
  { time: '15:42', logs: 200, errors: 17 },
  { time: '15:42:30', logs: 195, errors: 14 },
  { time: '15:43', logs: 170, errors: 5 }
];

// Service Filter Item
const ServiceItem: React.FC<ServiceItemProps> = ({ service, isSelected, onToggle }) => (
  <label className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3 flex-shrink-0"
      />
      <span className="text-xs text-gray-700 truncate" title={service.name}>
        {service.name}
      </span>
    </div>
    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2">
      {service.count}
    </span>
  </label>
);

// Log Histogram Chart Component
const LogHistogramChart = () => (
  <div className="h-32">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium text-gray-700">Log Volume Over Time</h4>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
          <span>Total Logs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
          <span>Errors</span>
        </div>
        <span>Max: 210 logs/30s</span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={histogramData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
        <CartesianGrid strokeDasharray="1 1" stroke="#f0f4f8" vertical={false} />
        <XAxis 
          dataKey="time" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#64748b' }}
          interval={4}
          angle={-45}
          textAnchor="end"
          height={40}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#64748b' }}
          width={25}
          domain={[0, 'dataMax + 20']}
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
            value,
            name === 'logs' ? 'Total Logs' : 'Errors'
          ]}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Bar 
          dataKey="logs" 
          fill="#60a5fa" 
          radius={[1, 1, 0, 0]}
          stroke="#3b82f6"
          strokeWidth={0.5}
        />
        <Bar 
          dataKey="errors" 
          fill="#f87171" 
          radius={[1, 1, 0, 0]}
          stroke="#ef4444"
          strokeWidth={0.5}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Level Badge Component
const LevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const getLevelMapping = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'Error';
      case 'WARN':
        return 'Pending';
      case 'INFO':
        return 'Completed';
      case 'DEBUG':
        return 'In Process';
      default:
        return 'Offline';
    }
  };

  return <StatusBadge status={getLevelMapping(level)} />;
};

// Format time function
const formatHrTime = (hrTime: [number, number]): string => {
  const [seconds, nanos] = hrTime ?? [0, 0];
  const millis = seconds * 1000 + Math.floor(nanos / 1_000_000);
  const date = new Date(millis);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return `${get('month')} ${get('day')} ${get('hour')}:${get('minute')}:${get('second')}.${String(date.getMilliseconds()).padStart(3, '0')}`;
};

// Main Log Explorer Component
export function LogExplorer() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { logs, isLoading, error, refreshData } = useLogs(autoRefresh);
  const [statusFilter, setStatusFilter] = useState<'all' | 'error' | 'success'>('all');
  useEffect(() => setCurrentPage(1), [searchQuery, statusFilter]);

  const handleRefresh = useCallback(() => refreshData(), [refreshData]);
  const handleAutoRefreshChange = useCallback(
    (checked: boolean) => {
      setAutoRefresh(checked);
      if (checked) refreshData();
    },
    [refreshData]
  );

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = !searchQuery || 
        log.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesService = selectedServices.size === 0 || selectedServices.has(log.serviceName || '');
      const matchesLevel = selectedLevels.size === 0 || selectedLevels.has(log.severityText || '');
      
      return matchesSearch && matchesService && matchesLevel;
    });
  }, [logs, searchQuery, selectedServices, selectedLevels]);

  const filteredServices = mockServices.filter(service =>
    service.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const toggleService = (serviceName: string): void => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceName)) {
      newSelected.delete(serviceName);
    } else {
      newSelected.add(serviceName);
    }
    setSelectedServices(newSelected);
  };

  const toggleLevel = (level: string): void => {
    const newSelected = new Set(selectedLevels);
    if (newSelected.has(level)) {
      newSelected.delete(level);
    } else {
      newSelected.add(level);
    }
    setSelectedLevels(newSelected);
  };

  const stats = useMemo(() => {
    if (!logs.length) {
      return { logsPerSecond: 0, errorRate: 0, uniqueServices: 0 };
    }

    const uniqueServices = new Set(logs.map(log => log.serviceName)).size;
    const errorCount = logs.filter(log => log.severityText === 'ERROR').length;
    const errorRate = (errorCount / logs.length) * 100;
    const logsPerSecond = Math.round((logs.length / 15) * 10) / 10;

    return { logsPerSecond, errorRate, uniqueServices };
  }, [logs]);

  return (
    <div>
      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <PageHeader
          title="Log Explorer"
          description="Monitor and analyze your application metrics"
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          onRefresh={handleRefresh}
        />
       
          {/* Stats Bar */}
        
          <div className="flex gap-3 mb-3">
          <StatCard
            title="Total Logs"
            value={stats.logsPerSecond.toString()}
            icon={Database}
            description="Last 24 hours"
          />
          <StatCard
            title="Error Rate %"
            value={stats.errorRate.toFixed(1)}
            icon={AlertCircle}
            description={`${stats.errorRate.toFixed(1)}% of total`}
            isNegative={1 > 0}
          />
          {/* <StatCard
            title="Warning Count"
            value={warnCount.toString()}
            icon={Clock}
            description={`${((warnCount / totalLogs) * 100).toFixed(1)}% of total`}
            isNegative={warnCount > 2}
          /> */}
          <StatCard
            title="Active Sources"
            value={stats.uniqueServices.toString()}
            icon={Activity}
            description="Services logging"
          />
        </div>
          {/* Top Search and Controls */}
          <div className="bg-white rounded border border-gray-200 p-3 mb-3 shadow-sm">
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder="Search logs..."
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
          <div className="flex gap-3">
            {/* Left Sidebar - Filters */}
            <div className="w-60 bg-white rounded border border-gray-200 p-3 shadow-sm h-fit">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">Filters</h3>
              
              <FilterSection title="Services">
                <SearchInput
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={setServiceSearch}
                  className="mb-2"
                />
                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  {filteredServices.map(service => (
                    <ServiceItem
                      key={service.name}
                      service={service}
                      isSelected={selectedServices.has(service.name)}
                      onToggle={() => toggleService(service.name)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Log Levels">
                <div className="space-y-1.5">
                  {['ERROR', 'WARN', 'INFO', 'DEBUG'].map(level => (
                    <label key={level} className="flex items-center gap-1.5">
                      <input 
                        type="checkbox" 
                        checked={selectedLevels.has(level)}
                        onChange={() => toggleLevel(level)}
                        className="rounded border-gray-300 w-3 h-3" 
                      />
                      <span className="text-xs text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Time Range">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5">
                    <input type="radio" name="timeRange" className="w-3 h-3" defaultChecked />
                    <span className="text-xs text-gray-700">Last 15 minutes</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="radio" name="timeRange" className="w-3 h-3" />
                    <span className="text-xs text-gray-700">Last hour</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="radio" name="timeRange" className="w-3 h-3" />
                    <span className="text-xs text-gray-700">Last 24 hours</span>
                  </label>
                </div>
              </FilterSection>
            </div>

            {/* Right Main Area */}
            <div className="flex-1">
              {/* Charts Section */}
              <div className="bg-white rounded border border-gray-200 p-4 mb-3 shadow-sm">
                <LogHistogramChart />
              </div>

              {/* Logs Table */}
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Logs ({filteredLogs.length})
                  </h3>
                </div>
                
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
                        Message
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell className="text-center py-8 text-gray-500 text-xs">
                          Loading logs...
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center py-8 text-gray-500 text-xs">
                          No logs found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow
                          key={log.hrTime?.toString()}
                          className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedLog?.id === log.hrTime?.toString() ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <TableCell className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <LevelBadge level={log.severityText || ''} />
                              <span className="text-xs text-gray-500">
                                {formatHrTime(log.hrTime || [0,0])}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2 whitespace-nowrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {log.serviceName}
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-gray-900 max-w-md truncate">
                            {log.body}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}