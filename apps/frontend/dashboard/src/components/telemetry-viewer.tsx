import { useState } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Trace, Log } from '@/services/telemetry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function TelemetryViewer() {
  const { traces = [], logs = [], isLoading, error, refreshData } = useTelemetry();
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  if (isLoading) {
    return <div>Loading telemetry data...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  console.log(traces);
  return (
    <Tabs defaultValue="traces" className="w-full">
      <TabsList>
        <TabsTrigger value="traces">Traces</TabsTrigger>
        {/* <TabsTrigger value="logs">Logs</TabsTrigger> */}
      </TabsList>

      <TabsContent value="traces" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Trace List</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {traces.map((trace) => (
                    <div
                      key={trace.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-accent"
                      onClick={() => setSelectedTrace(trace)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{trace.name}</span>
                        <Badge variant={trace.status === 'success' ? 'default' : 'destructive'}>
                          {trace.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(trace.timestamp), 'PPpp')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Duration: {trace.duration}ms
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {selectedTrace && (
            <Card>
              <CardHeader>
                <CardTitle>Trace Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <pre className="p-4 bg-muted rounded-lg">
                    {JSON.stringify(selectedTrace, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="logs" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Log Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.service}</span>
                      <Badge variant={log.level === 'error' ? 'destructive' : 'default'}>
                        {log.level}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(log.timestamp), 'PPpp')}
                    </div>
                    <div className="mt-2">{log.message}</div>
                    {log.metadata && (
                      <pre className="mt-2 text-sm bg-muted p-2 rounded">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 