import { useTelemetry } from '@/hooks/useTelemetry';
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
  Loader2, 
  Search, 
  RefreshCw, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { type SpanData} from '@/services/telemetry';
import { SpanStatusCode } from '@opentelemetry/api';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Pagination } from '@/components/ui/pagination';
import { ReadableSpan } from '@opentelemetry/sdk-trace-node';

function formatDuration(duration: number): string {
  if (duration < 1000) return `${duration}ms`;
  return `${(duration / 1000).toFixed(2)}s`;
}

function StatusBadge({ code }: { code: SpanStatusCode }) {
  if (code === SpanStatusCode.OK || code === SpanStatusCode.UNSET) {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        OK
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
      <AlertCircle className="mr-1 h-3 w-3" />
      Error
    </Badge>
  );
}

function SpanDetails({ span }: { span: ReadableSpan }) {
  const hasEvents = span.events && span.events.length > 0;
  const hasLinks = span.links && span.links.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 font-medium">Span Details</h4>
        <div className="space-y-1 text-sm">
          {/* <div><span className="text-gray-500">Trace ID:</span> {span.spanContext().traceId}</div>
          <div><span className="text-gray-500">Span ID:</span> {span.spanContext().spanId}</div> */}
          {span.parentSpanId && (
            <div><span className="text-gray-500">Parent Span:</span> {span.parentSpanId}</div>
          )}
        </div>
      </div>

      <div>
        <h4 className="mb-2 font-medium">Attributes</h4>
        <pre className="max-h-48 overflow-auto rounded bg-muted p-2 text-sm">
          {JSON.stringify(span.attributes, null, 2)}
        </pre>
      </div>

      {hasEvents && (
        <div>
          <h4 className="mb-2 font-medium">Events</h4>
          <div className="space-y-2">
            {span.events.map((event, index) => (
              <div key={index} className="rounded border bg-card p-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{event.name}</span>
                 {/*  <span className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span> */}
                </div>
               {/*  {Object.keys(event.attributes).length > 0 && (
                  <pre className="mt-2 max-h-24 overflow-auto rounded bg-muted p-2 text-sm">
                    {JSON.stringify(event.attributes, null, 2)}
                  </pre>
                )} */}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasLinks && (
        <div>
          <h4 className="mb-2 font-medium">Links</h4>
          <div className="space-y-2">
           {/*  {span.links.map((link, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Span:</span>
                <span>{link.spanId}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="text-muted-foreground">Trace:</span>
                <span>{link.traceId}</span>
              </div>
            ))} */}
          </div>
        </div>
      )}
    </div>
  );
}

export function TelemetryViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'error' | 'success'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedSpan, setSelectedSpan] = useState<ReadableSpan | null>(null);
  const [newSpanIds, setNewSpanIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const prevSpansRef = useRef<ReadableSpan[]>([]);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [currentLogPage, setCurrentLogPage] = useState(1);
  const [logPageSize] = useState(10);
  const { spans, logs, isLoading, error, refreshData } = useTelemetry(autoRefresh);

  useEffect(() => {
    const newIds = spans
      .filter(span => !prevSpansRef.current.find(p => p.spanContext().spanId === span.spanContext().spanId))
      .map(span => span.spanContext().spanId);
    
    if (newIds.length > 0) {
      setNewSpanIds(new Set(newIds));
      const timer = setTimeout(() => {
        setNewSpanIds(new Set());
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    prevSpansRef.current = spans;
  }, [spans]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleAutoRefreshChange = useCallback((checked: boolean) => {
    setAutoRefresh(checked);
    if (checked) {
      refreshData();
    }
  }, [refreshData]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      //console.log(log)
      // Adjust this filter logic as needed for your log structure
      const matchesSearch =
        logSearchQuery === '' ||
        (log.message && log.message.toLocaleString().toLowerCase().includes(logSearchQuery.toLowerCase())) ;
        //||
        // (log.severityText && log.severityText.toLowerCase().includes(logSearchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [logs, logSearchQuery]);
  
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentLogPage - 1) * logPageSize;
    return filteredLogs.slice(startIndex, startIndex + logPageSize);
  }, [filteredLogs, currentLogPage, logPageSize]);
  
  const totalLogPages = Math.max(1, Math.ceil(filteredLogs.length / logPageSize));
  const filteredSpans = useMemo(() => {
    return spans.filter(span => {
      const matchesSearch = searchQuery === '' || 
        span.name.toLowerCase().includes(searchQuery.toLowerCase())/*  ||
        span.traceId.includes(searchQuery) ||
        span.spanId.includes(searchQuery) */;

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'error' && span.status.code === SpanStatusCode.ERROR) ||
        (statusFilter === 'success' && (span.status.code === SpanStatusCode.OK || span.status.code === SpanStatusCode.UNSET));

      return matchesSearch && matchesStatus;
    });
  }, [spans, searchQuery, statusFilter]);

  const paginatedSpans = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSpans.slice(startIndex, startIndex + pageSize);
  }, [filteredSpans, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredSpans.length / pageSize));

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-2xl font-bold">Telemetry Viewer</CardTitle>
            {autoRefresh ? (
              <Badge variant="outline" className="bg-green-50">
                <Wifi className="mr-1 h-3 w-3 text-green-600" />
                <span className="text-green-600">Live</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50">
                <WifiOff className="mr-1 h-3 w-3 text-gray-600" />
                <span className="text-gray-600">Manual</span>
              </Badge>
            )}
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
              <RefreshCw className={cn("h-4 w-4 mr-2", { "animate-spin": isLoading })} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search spans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={statusFilter === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'success' ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter('success')}
            >
              Success
            </Button>
            <Button
              variant={statusFilter === 'error' ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter('error')}
            >
              Error
            </Button>
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
                                {
                                  "bg-green-50": newSpanIds.has(span.spanContext().spanId),
                                }
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
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trace ID</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            {searchQuery || statusFilter !== 'all'
                              ? 'No spans match the current filters'
                              : 'No spans available'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <AnimatePresence>
                          {paginatedLogs.map((span) => (
                            <TableRow
                              key={crypto.randomUUID()}
                              className={cn(
                                "cursor-pointer transition-colors hover:bg-muted/50",
                                {
                                  "bg-green-50": newSpanIds.has(span.message || ''),
                                }
                              )}
                              // onClick={() => setSelectedSpan(span)}
                            >
                              <TableCell className="font-medium">{span.message}</TableCell>
                              <TableCell className="font-medium">{span.timestamp}</TableCell>
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
        </Tabs>
      </CardContent>

      <Sheet open={!!selectedSpan} onOpenChange={(open) => !open && setSelectedSpan(null)}>
        <SheetContent className="w-full max-w-xl">
          <SheetHeader>
            <SheetTitle>{selectedSpan?.name}</SheetTitle>
            {selectedSpan && (
              <SheetDescription>
                {(selectedSpan.status.code === SpanStatusCode.OK || selectedSpan.status.code === SpanStatusCode.UNSET) ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Completed successfully
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {selectedSpan.status.message || 'Error occurred'}
                  </div>
                )}
              </SheetDescription>
            )}
          </SheetHeader>
          <ScrollArea className="h-full py-4">
            {selectedSpan && <SpanDetails span={selectedSpan} />}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </Card>
  );
} 