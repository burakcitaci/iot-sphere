import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Query {
  id: number;
  metric: string;
  aggregation: string;
  groupBy: string;
  filters: any[];
}

interface MetricsChartProps {
  queries: Query[];
  timeRange: string;
}

export const MetricsChart = ({ queries, timeRange }: MetricsChartProps) => {
  // Generate sample data based on the time range
  const generateData = () => {
    const points = timeRange === '5m' ? 30 : timeRange === '15m' ? 60 : 120;
    const data = [];
    
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(Date.now() - (points - i) * 60000);
      const dataPoint: any = {
        time: timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        timestamp
      };
      
      queries.forEach((query, index) => {
        if (query.metric) {
          // Generate realistic-looking data with some variation
          const baseValue = query.metric.includes('cpu') ? 5 : 
                           query.metric.includes('memory') ? 65 : 
                           query.metric.includes('network') ? 1000 : 50;
          
          const variation = Math.sin(i * 0.2) * 2 + Math.random() * 3;
          dataPoint[`query_${index}`] = Math.max(0, baseValue + variation);
        }
      });
      
      data.push(dataPoint);
    }
    
    return data;
  };

  const data = generateData();
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  const formatMetricName = (metric: string) => {
    return metric.split('.').pop() || metric;
  };

  const stats = {
    maxValue: Math.max(...data.map(d => Math.max(...queries.map((_, i) => d[`query_${i}`] || 0)))),
    avgValue: data.length > 0 ? data.reduce((sum, d) => sum + (d[`query_0`] || 0), 0) / data.length : 0,
    dataPoints: data.length
  };

  return (
    <div>
      {/* Chart Stats */}
      <div className="flex gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span>Max: {stats.maxValue.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Avg: {stats.avgValue.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Points: {stats.dataPoints}</span>
        </div>
        {queries.map((query, index) => (
          query.metric && (
            <div key={query.id} className="flex items-center gap-1">
              <div 
                className="w-3 h-2 rounded-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span>{formatMetricName(query.metric)}</span>
            </div>
          )
        ))}
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="1 1" stroke="#f0f4f8" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 8)}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(value) => `${value.toFixed(0)}`}
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
                value?.toFixed(2),
                name.replace('query_', 'Query ')
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px' }}
              formatter={(value, entry) => {
                const queryIndex = parseInt(value.replace('query_', ''));
                const query = queries[queryIndex];
                return query?.metric ? `${query.aggregation}:${formatMetricName(query.metric)}` : value;
              }}
            />
            {queries.map((query, index) => (
              query.metric && (
                <Line
                  key={query.id}
                  type="monotone"
                  dataKey={`query_${index}`}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
