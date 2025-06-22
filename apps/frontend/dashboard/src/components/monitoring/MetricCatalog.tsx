import React, { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OtelMetric } from '@iot-sphere/entity-lib';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricCatalogProps {
    metrics: OtelMetric[];
    searchQuery: string;
    error: Error | null;
}

const filterGroups = [
    {
        name: 'Configuration',
        filters: [
            { label: 'All tags', count: '334' },
            { label: 'Configured tags', count: '0' },
        ],
    },
    {
        name: 'Percentiles',
        filters: [
            { label: 'Enabled percentiles', count: '327' },
            { label: 'Disabled percentiles', count: '92' },
        ],
    },
    {
        name: 'Historical Metrics',
        filters: [
            { label: 'Enabled historical metrics', count: '0' },
            { label: 'Disabled historical metrics', count: '4.84K' },
        ],
    },
    {
        name: 'Query Activity',
        filters: [
            { label: 'Queried in 30 days', count: '1.74K' },
            { label: 'Not queried in 30 days', count: '3.1K' },
            { label: 'Not queried in 60 days', count: '2.95K' },
            { label: 'Not queried in 90 days', count: '2.72K' },
        ],
    },
    {
        name: 'Related Assets',
        filters: [
            { label: 'Used in assets (dashboards...)', count: '771' },
            { label: 'Not used in any asset', count: '4.07K' },
        ],
    },
    {
        name: 'Metric Type',
        filters: [
            { label: 'Distributions', count: '419' },
            { label: 'Counts, Rates, Gauges', count: '4.42K' },
        ],
    },
];

const FilterSidebar = () => {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({
    'Configuration': true,
    'Percentiles': true,
    'Historical Metrics': true,
    'Query Activity': true,
    'Related Assets': true,
    'Metric Type': true,
  });

  const toggleOpen = (name: string) => {
    setOpenStates(prev => ({...prev, [name]: !prev[name]}));
  };

  return (
    <Card className="w-80 flex-shrink-0 rounded-sm bg-transparent shadow-none border p-2">
      <CardContent className="p-0">
        {filterGroups.map((group) => (
          <Collapsible key={group.name} open={openStates[group.name]} onOpenChange={() => toggleOpen(group.name)} className="mb-1">
            <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center text-sm font-semibold p-1 hover:bg-gray-100 rounded-sm">
                    {openStates[group.name] ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                    <span>{group.name}</span>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="space-y-2 pl-5 pt-1">
                  {group.filters.map((filter) => (
                    <div key={filter.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Checkbox id={filter.label} defaultChecked className="mr-2" />
                        <label htmlFor={filter.label} className="text-gray-700">{filter.label}</label>
                      </div>
                      <span className="text-gray-500">{filter.count}</span>
                    </div>
                  ))}
                </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};

const MetricCatalog: React.FC<MetricCatalogProps> = ({ metrics, searchQuery, error }) => {
  const [selectedMetricName, setSelectedMetricName] = useState<string | null>(null);

  const metricList = useMemo(() => {
    const names = new Set<string>();
    metrics.forEach((otelMetric) => {
      otelMetric.scopeMetrics.forEach(scopeMetric => {
        scopeMetric.metrics.forEach(metric => {
          names.add(metric.descriptor.name);
        });
      });
    });
    const namesArray = Array.from(names).map(name => ({ name, lastConfigured: '-' }));
    if (!searchQuery) {
        return namesArray;
    }
    return namesArray.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [metrics, searchQuery]);

  const selectedMetricData = useMemo(() => {
    if (!selectedMetricName) return null;

    const valueMap = new Map<string, number>();

    metrics.forEach(otelMetric => {
      otelMetric.scopeMetrics.forEach(sm => {
        sm.metrics.forEach(m => {
          if (m.descriptor.name === selectedMetricName) {
            m.dataPoints.forEach(dp => {
              const ts = new Date(dp.endTime[0] * 1000 + dp.endTime[1] / 1e6).toISOString();
              const currentValue = valueMap.get(ts) || 0;
              valueMap.set(ts, currentValue + dp.value);
            });
          }
        });
      });
    });
    
    const dataPoints = Array.from(valueMap, ([time, value]) => ({ time, value }));
    return dataPoints.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [selectedMetricName, metrics]);


  const renderChart = () => (
    <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={selectedMetricData || []}>
            <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
                dataKey="time" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString()} 
                axisLine={false} 
                tickLine={false}
            />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
        </AreaChart>
    </ResponsiveContainer>
  );

  const stats = (
    <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-3">
        <span>{metricList.length.toLocaleString()} metrics found</span>
        <span className="text-gray-400">•</span>
        <span>Showing {Math.min(50, metricList.length)} of {metricList.length}</span>
        {error && (
            <>
            <span className="text-gray-400">•</span>
            <span className="text-red-600">{error.message}</span>
            </>
        )}
        </div>
    </div>
  );

  return (
    <div className="flex gap-4 h-full">
      <FilterSidebar />
      <Card className="flex-1 rounded-sm bg-transparent shadow-none border">
        <CardHeader className="p-0">
            <div className="border-b">
              <div className="px-6 py-1">{stats}</div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {selectedMetricName ? (
            <div>
                <div className="p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold">{selectedMetricName}</h3>
                    <Button onClick={() => setSelectedMetricName(null)}>Back to metrics</Button>
                </div>
                {selectedMetricData && selectedMetricData.length > 0 ? renderChart() : <p className="p-4">No data to display for this metric.</p>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>METRIC NAME</TableHead>
                  <TableHead>LAST CONFIGURED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricList.length > 0 ? (
                  metricList.map((metric) => (
                    <TableRow key={metric.name} onClick={() => setSelectedMetricName(metric.name)} className="cursor-pointer hover:bg-gray-50">
                      <TableCell>{metric.name}</TableCell>
                      <TableCell>{metric.lastConfigured}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No metrics found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricCatalog; 