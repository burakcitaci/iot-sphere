import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Loader2, Search, RefreshCw, Clock, ArrowRight, AlertCircle, CheckCircle2, Wifi, WifiOff
} from 'lucide-react';
import { SpanContext, SpanStatusCode } from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/sdk-trace-node';
import { OtelSpan } from '@iot-sphere/entity-lib';
import { AnimatePresence, motion } from 'framer-motion';
import { useTelemetry } from '@/hooks/useTelemetry';
import { cn } from '@/lib/utils';
import { Pagination } from './ui/pagination';

function formatDuration(duration: number): string {
  return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;
}

function StatusBadge({ code }: { code: SpanStatusCode }) {
  const isSuccess = code === SpanStatusCode.OK || code === SpanStatusCode.UNSET;
  return (
    <Badge className={cn(isSuccess ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200')}>
      {isSuccess ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
      {isSuccess ? 'OK' : 'Error'}
    </Badge>
  );
}

function getSpanContext(span: ReadableSpan | { spanContext: SpanContext }): SpanContext {
  return typeof span.spanContext === 'function' ? span.spanContext() : span.spanContext;
}

function formatHrTime(hrTime: [number, number]): string {
  const [seconds, nanos] = hrTime ?? [0, 0];
  const millis = seconds * 1000 + Math.floor(nanos / 1_000_000);
  const date = new Date(millis);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '';
  return `${get('month')} ${get('day')} ${get('hour')}:${get('minute')}:${get('second')}.${String(date.getMilliseconds()).padStart(3, '0')}`;
}

export function TelemetryViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'error' | 'success'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedSpan, setSelectedSpan] = useState<OtelSpan | null>(null);
  const [newSpanIds, setNewSpanIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const prevSpansRef = useRef<OtelSpan[]>([]);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [currentLogPage, setCurrentLogPage] = useState(1);
  const [logPageSize] = useState(10);
  const { spans, logs, isLoading, error, refreshData } = useTelemetry(autoRefresh);

  useEffect(() => {
    const newIds = spans
      .filter(span => !prevSpansRef.current.find(p => getSpanContext(p).spanId === getSpanContext(span).spanId))
      .map(span => getSpanContext(span).spanId);
    if (newIds.length > 0) {
      setNewSpanIds(new Set(newIds));
      const timer = setTimeout(() => setNewSpanIds(new Set()), 3000);
      return () => clearTimeout(timer);
    }
    prevSpansRef.current = spans;
  }, [spans]);

  useEffect(() => setCurrentPage(1), [searchQuery, statusFilter]);

  const handleRefresh = useCallback(() => refreshData(), [refreshData]);
  const handleAutoRefreshChange = useCallback((checked: boolean) => {
    setAutoRefresh(checked);
    if (checked) refreshData();
  }, [refreshData]);

  const filteredSpans = useMemo(() => spans.filter(span => {
    const matchesSearch = !searchQuery || span.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'error' && span.status.code === SpanStatusCode.ERROR) ||
      (statusFilter === 'success' && (span.status.code === SpanStatusCode.OK || span.status.code === SpanStatusCode.UNSET));
    return matchesSearch && matchesStatus;
  }), [spans, searchQuery, statusFilter]);

  const paginatedSpans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSpans.slice(start, start + pageSize);
  }, [filteredSpans, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredSpans.length / pageSize));

  const filteredLogs = useMemo(() => logs.filter(log => {
    return !logSearchQuery || (log.body && log.body.toString().toLowerCase().includes(logSearchQuery.toLowerCase()));
  }), [logs, logSearchQuery]);

  const paginatedLogs = useMemo(() => {
    const start = (currentLogPage - 1) * logPageSize;
    return filteredLogs.slice(start, start + logPageSize);
  }, [filteredLogs, currentLogPage, logPageSize]);

  const totalLogPages = Math.max(1, Math.ceil(filteredLogs.length / logPageSize));

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-2xl font-bold">Telemetry Viewer</CardTitle>
            <Badge variant="outline" className={cn(autoRefresh ? 'bg-green-50' : 'bg-gray-50')}>
              {autoRefresh ? <Wifi className="mr-1 h-3 w-3 text-green-600" /> : <WifiOff className="mr-1 h-3 w-3 text-gray-600" />}
              <span className={cn(autoRefresh ? 'text-green-600' : 'text-gray-600')}>{autoRefresh ? 'Live' : 'Manual'}</span>
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={handleAutoRefreshChange} />
              <Label htmlFor="auto-refresh">Auto-refresh</Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || autoRefresh}>
              <RefreshCw className={cn("h-4 w-4 mr-2", { "animate-spin": isLoading })} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="Search spans..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
          </div>
          <div className="flex items-center space-x-2">
            {['all', 'success', 'error'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status as typeof statusFilter)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spans">
          <TabsList>
            <TabsTrigger value="spans">Spans</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="spans">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="mt-4">
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trace ID</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSpans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            {searchQuery || statusFilter !== 'all'
                              ? 'No spans match the current filters'
                              : 'No spans available'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <AnimatePresence>
                          {paginatedSpans.map((span) => (
                            <TableRow
                              key={crypto.randomUUID()}
                              className={cn(
                                "cursor-pointer transition-colors hover:bg-muted/50",
                               /*  {
                                  "bg-green-50": newSpanIds.has(getSpanContext(span).spanId),
                                } */
                              )}
                              onClick={() => setSelectedSpan(span)}
                            >
                              <TableCell className="font-medium">{span.name}</TableCell>
                              {/* <TableCell>
                                <StatusBadge code={span.status.code} />
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {span.traceId.slice(0, 8)}...
                              </TableCell>
                              <TableCell>
                                {new Date(span.startTime).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>{formatDuration(span.duration)}</span>
                                </div>
                              </TableCell> */}
                            </TableRow>
                          ))}
                        </AnimatePresence>
                      )}
                    </TableBody>
                  </Table>
                  {paginatedSpans.length > 0 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </TabsContent>
          <TabsContent value="logs">
          {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="mt-4">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1"></TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Log Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          {searchQuery || statusFilter !== 'all'
                            ? 'No spans match the current filters'
                            : 'No spans available'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <AnimatePresence>
                        {paginatedLogs.map((span) => {
                         const getBorderColor = () => {
                          switch(span.severityText) {
                            case "INFO": return "#60a5fa"; // blue-400
                            case "DEBUG": return "#9ca3af"; // gray-400
                            case "WARN": return "#fbbf24"; // yellow-400
                            case "ERROR": return "#f87171"; // red-400
                            case "CRITICAL": return "#db2777"; // pink-600
                            default: return "#e5e7eb"; // bg-muted
                          }
                        };
                          return (
                            <TableRow
                            key={crypto.randomUUID()}
                            className="group cursor-pointer transition-colors hover:bg-muted/50"
                            style={{ borderLeft: `4px solid ${getBorderColor()}` }}
                          >
                              <TableCell className="p-0 w-1">
                              <div className={`h-full w-1 bg-red-400`} />
                              </TableCell>
                              <TableCell className="font-medium">{formatHrTime(span.hrTime ?? [0,0])}</TableCell>
                              <TableCell className="font-medium">{span.host}</TableCell>
                              <TableCell className="font-medium">{span.serviceName}</TableCell>
                              <TableCell className="font-medium">{span.body}</TableCell>
                              <TableCell className="font-medium">{span.severityText}</TableCell>
                            </TableRow>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
                {paginatedSpans.length > 0 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </ScrollArea>
            </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
