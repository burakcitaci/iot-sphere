import { useNavigate } from 'react-router-dom';
import { Clock, Search, Filter, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const LogExplorer = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'error' | 'success'>(
    'all'
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [currentLogPage, setCurrentLogPage] = useState(1);
  const [logPageSize] = useState(10);
  const { spans, logs, isLoading, error, refreshData } =
    useTelemetry(autoRefresh);

  useEffect(() => setCurrentPage(1), [searchQuery, statusFilter]);

  const handleRefresh = useCallback(() => refreshData(), [refreshData]);
  const handleAutoRefreshChange = useCallback(
    (checked: boolean) => {
      setAutoRefresh(checked);
      if (checked) refreshData();
    },
    [refreshData]
  );

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        return (
          !logSearchQuery ||
          (log.body &&
            log.body
              .toString()
              .toLowerCase()
              .includes(logSearchQuery.toLowerCase()))
        );
      }),
    [logs, logSearchQuery]
  );

  const paginatedLogs = useMemo(() => {
    const start = (currentLogPage - 1) * logPageSize;
    return filteredLogs.slice(start, start + logPageSize);
  }, [filteredLogs, currentLogPage, logPageSize]);
  function formatHrTime(hrTime: [number, number]): string {
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
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value || '';
    return `${get('month')} ${get('day')} ${get('hour')}:${get('minute')}:${get(
      'second'
    )}.${String(date.getMilliseconds()).padStart(3, '0')}`;
  }
  const totalLogPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / logPageSize)
  );
  /*   const logs = [
    {
      id: "log-75922474876857400",
      service: "coffee-house",
      message: "Request completed successfully",
      level: "INFO",
      timestamp: "Feb 7, 4:13 pm",
      attributes: {
        http_status: 200,
        method: "GET",
        path: "/coffeehouse"
      }
    },
    {
      id: "log-75922474876857401",
      service: "coffee-house",
      message: "Internal server error: Failed to process order",
      level: "ERROR",
      timestamp: "Feb 7, 4:12 pm",
      attributes: {
        http_status: 500,
        method: "POST",
        path: "/order",
        error: "Database connection timeout"
      }
    },
    {
      id: "log-75922474876857402",
      service: "inventory-service",
      message: "Stock check completed",
      level: "INFO",
      timestamp: "Feb 7, 4:11 pm",
      attributes: {
        http_status: 200,
        method: "GET",
        path: "/stock",
        items_in_stock: 37
      }
    },
    {
      id: "log-75922474876857403",
      service: "payment-service",
      message: "Payment processing failed: Invalid card details",
      level: "WARN",
      timestamp: "Feb 7, 4:10 pm",
      attributes: {
        http_status: 400,
        method: "POST",
        path: "/payment/process",
        transaction_id: "txn_7392815"
      }
    },
    {
      id: "log-75922474876857404",
      service: "auth-service",
      message: "User authentication successful",
      level: "DEBUG",
      timestamp: "Feb 7, 4:09 pm",
      attributes: {
        http_status: 200,
        method: "POST",
        path: "/auth/login",
        user_id: "usr_5839204"
      }
    }
  ];
 */
  const getLevelBadgeStyle = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-[#2D1B1B] text-[#FF5252]';
      case 'WARN':
        return 'bg-[#2D271B] text-[#FFB052]';
      case 'INFO':
        return 'bg-[#1B2D26] text-[#52FF9A]';
      case 'DEBUG':
        return 'bg-[#1B262D] text-[#52C6FF]';
      default:
        return 'bg-[#1E2D1B] text-[#4CAF50]';
    }
  };
  // Calculate log level distribution
  const logLevels = {
    ERROR: {
      count: logs.filter((log) => log.severityText === 'ERROR').length,
      percentage: 0,
    },
    WARN: {
      count: logs.filter((log) => log.severityText === 'WARN').length,
      percentage: 0,
    },
    INFO: {
      count: logs.filter((log) => log.severityText === 'INFO').length,
      percentage: 0,
    },
    DEBUG: {
      count: logs.filter((log) => log.severityText === 'DEBUG').length,
      percentage: 0,
    },
  };

  const totalLogs = logs.length;

  // Calculate percentages for each level
  Object.keys(logLevels).forEach((level) => {
    const typedLevel = level as keyof typeof logLevels;
    logLevels[typedLevel].percentage = totalLogs
      ? Math.round((logLevels[typedLevel].count / totalLogs) * 100)
      : 0;
  });

  const stats = useCallback(() => {
    if (!logs.length) {
      return {
        logsPerSecond: 0,
        errorRate: 0,
        uniqueServices: 0,
      };
    }

    // For a real implementation, these would be calculated from actual metrics
    const uniqueServices = new Set(logs.map((log) => log.serviceName)).size;
    const errorCount = logs.filter(
      (log) => log.severityText === 'ERROR'
    ).length;
    const errorRate = (errorCount / logs.length) * 100;

    // This is just a placeholder calculation - real implementation would use timestamps
    const logsPerSecond = Math.round((logs.length / 15) * 10) / 10; // Assuming 15 minutes of data

    return {
      logsPerSecond: logsPerSecond,
      errorRate: errorRate,
      uniqueServices: uniqueServices,
    };
  }, [logs]);

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-500';
      case 'WARN':
        return 'text-yellow-500';
      case 'INFO':
        return 'text-green-500';
      case 'DEBUG':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };
  return (
    <div className="px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-2xl font-bold">Log Explorer</CardTitle>
              <Badge
                variant="outline"
                className={cn(autoRefresh ? 'bg-green-50' : 'bg-gray-50')}
              >
                {autoRefresh ? (
                  <Wifi className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <WifiOff className="mr-1 h-3 w-3 text-gray-600" />
                )}
                <span
                  className={cn(
                    autoRefresh ? 'text-green-600' : 'text-gray-600'
                  )}
                >
                  {autoRefresh ? 'Live' : 'Manual'}
                </span>
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={handleAutoRefreshChange}
                />
                <Label htmlFor="auto-refresh">Auto-refresh</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || autoRefresh}
              >
                <RefreshCw
                  className={cn('h-4 w-4 mr-2', { 'animate-spin': isLoading })}
                />
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between my-6">
            <div className="flex gap-4">
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
                <div className="text-xs text-gray-500 mb-1">Logs/second</div>
                <div className="text-xl font-medium text-gray-800">
                  {stats().logsPerSecond}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
                <div className="text-xs text-gray-500 mb-1">Error Rate</div>
                <div className="text-xl font-medium text-red-500">
                  {stats().errorRate}%
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
                <div className="text-xs text-gray-500 mb-1">
                  Unique Services
                </div>
                <div className="text-xl font-medium text-gray-800">
                  {stats().uniqueServices}
                </div>
              </div>
            </div>
          </div>

          {/* Filters bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-grow">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-md pl-10 pr-4 py-1 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-800 rounded-md px-4 py-1 text-xs hover:bg-gray-100 transition-colors">
                <Filter size={16} />
                <span>Filter</span>
              </button>
              <button
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-800 rounded-md px-4 py-1 text-xs hover:bg-gray-100 transition-colors"
                onClick={refreshData}
              >
                <Clock size={16} />
                <span>Last 15 minutes</span>
              </button>
            </div>
          </div>

          {/* Log distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="text-sm font-medium text-gray-800 mb-3">
              Log Level Distribution
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-red-500">ERROR</span>
                  <span className="text-sm text-gray-800">
                    {logLevels.ERROR.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${logLevels.ERROR.percentage}%` }}
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-yellow-500">WARN</span>
                  <span className="text-sm text-gray-800">
                    {logLevels.WARN.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${logLevels.WARN.percentage}%` }}
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-500">INFO</span>
                  <span className="text-sm text-gray-800">
                    {logLevels.INFO.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${logLevels.INFO.percentage}%` }}
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-500">DEBUG</span>
                  <span className="text-sm text-gray-800">
                    {logLevels.DEBUG.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${logLevels.DEBUG.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logs table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                  <TableHead className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Timestamp
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Service
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Message
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Attributes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500"
                    >
                      Loading logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500"
                    >
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow
                      key={crypto.randomUUID()}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      /* onClick={() => navigate(`/logs/${log.id}`)} */
                    >
                      <TableCell className="px-4 py-1 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 mr-3 rounded text-xs font-medium border border-gray-200 ${getLevelStyle(
                              log.severityText ?? ''
                            )}`}
                          >
                            {log.severityText}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatHrTime(log.hrTime ?? [0, 0])}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-1 whitespace-nowrap">
                        <span className="text-sm text-gray-800">
                          {log.serviceName}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-1">
                        <div className="max-w-md truncate">
                          <span className="text-sm text-gray-800">
                            {log.body}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-1">
                        {/*  <div className="flex flex-wrap gap-1">
                    {Object.entries(log.attributes).map(([key, value]) => (
                      <span key={key} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600">
                        {key}: <span className="ml-1 text-blue-500">{value}</span>
                      </span>
                    ))}
                  </div> */}
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
  );
};
