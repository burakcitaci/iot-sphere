import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, TrendingUp, Clock, Server } from 'lucide-react';

// Sample data structure matching your format
const sampleChartData = [
  {
    "descriptor": {
      "name": "http_requests_total",
      "type": "COUNTER",
      "description": "Total number of HTTP requests",
      "unit": "",
      "valueType": 1,
      "advice": {}
    },
    "aggregationTemporality": 1,
    "dataPointType": 3,
    "dataPoints": [
      {
        "attributes": {
          "method": "GET",
          "route": "hello",
          "status_code": "204"
        },
        "startTime": [1748533225, 168000000],
        "endTime": [1748533229, 342000000],
        "value": 1
      },
      {
        "attributes": {
          "method": "POST",
          "route": "api/users",
          "status_code": "200"
        },
        "startTime": [1748533230, 168000000],
        "endTime": [1748533234, 342000000],
        "value": 3
      },
      {
        "attributes": {
          "method": "GET",
          "route": "api/data",
          "status_code": "200"
        },
        "startTime": [1748533235, 168000000],
        "endTime": [1748533239, 342000000],
        "value": 5
      },
      {
        "attributes": {
          "method": "DELETE",
          "route": "api/users",
          "status_code": "404"
        },
        "startTime": [1748533240, 168000000],
        "endTime": [1748533244, 342000000],
        "value": 2
      }
    ],
    "isMonotonic": true
  }
];

interface MetricsChartProps {
  queries?: string[];
  timeRange?: string;
  chartData: any[];
}

const HttpMetricsChart: React.FC<MetricsChartProps> = ({ 
  queries = [], 
  timeRange = "Last 24 hours", 
  chartData 
}) => {
  // Transform OpenTelemetry data for chart visualization
  const transformDataForChart = (metricsData: any[]) => {
    const transformedData: any[] = [];
    const methodColors = {
      'GET': '#10b981',
      'POST': '#3b82f6', 
      'PUT': '#f59e0b',
      'DELETE': '#ef4444',
      'PATCH': '#8b5cf6'
    };

    metricsData.forEach((metric) => {
      if (metric.dataPoints) {
        metric.dataPoints.forEach((point: any, index: number) => {
          const timestamp = point.startTime[0] * 1000; // Convert to milliseconds
          const time = new Date(timestamp).toLocaleTimeString();
          
          transformedData.push({
            time,
            timestamp,
            value: point.value,
            method: point.attributes?.method || 'Unknown',
            route: point.attributes?.route || 'Unknown',
            status_code: point.attributes?.status_code || 'Unknown',
            color: methodColors[point.attributes?.method as keyof typeof methodColors] || '#6b7280'
          });
        });
      }
    });

    return transformedData.sort((a, b) => a.timestamp - b.timestamp);
  };

  // Aggregate data by method for summary stats
  const getMethodStats = (data: any[]) => {
    const stats: { [key: string]: { count: number; total: number } } = {};
    
    data.forEach(point => {
      const method = point.method;
      if (!stats[method]) {
        stats[method] = { count: 0, total: 0 };
      }
      stats[method].count += 1;
      stats[method].total += point.value;
    });

    return Object.entries(stats).map(([method, stat]) => ({
      method,
      requests: stat.total,
      count: stat.count
    }));
  };

  const chartDataProcessed = transformDataForChart(chartData.length > 0 ? chartData : sampleChartData);
  const methodStats = getMethodStats(chartDataProcessed);
  const totalRequests = chartDataProcessed.reduce((sum, point) => sum + point.value, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          <p className="text-blue-600">{`Requests: ${data.value}`}</p>
          <p className="text-sm text-gray-600">{`${data.method} ${data.route}`}</p>
          <p className="text-sm text-gray-600">{`Status: ${data.status_code}`}</p>
        </div>
      );
    }
    return null;
  };

  if (chartDataProcessed.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center text-gray-500">
          <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium">No metrics data available</p>
          <p className="text-xs text-gray-400">Waiting for HTTP request metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Range</p>
              <p className="text-sm font-semibold text-gray-900">{timeRange}</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Points</p>
              <p className="text-2xl font-bold text-gray-900">{chartDataProcessed.length}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Methods</p>
              <p className="text-2xl font-bold text-gray-900">{methodStats.length}</p>
            </div>
            <Server className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">HTTP Requests Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartDataProcessed}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                allowDecimals={false} 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Method Breakdown Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests by HTTP Method</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={methodStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="method" 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                allowDecimals={false} 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [value, name === 'requests' ? 'Total Requests' : 'Data Points']}
                labelFormatter={(label: string) => `Method: ${label}`}
              />
              <Legend />
              <Bar dataKey="requests" fill="#3b82f6" name="Total Requests" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Debug Info */}
      {queries.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Visualizing data for {queries.length} queries over {timeRange}
          </p>
        </div>
      )}
    </div>
  );
};

export default HttpMetricsChart;