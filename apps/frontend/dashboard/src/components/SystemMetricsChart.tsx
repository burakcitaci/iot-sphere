import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface SystemMetricsChartsProps {
  system: any;
}

// Mock historical power data
const powerHistoryData = [
  { time: '15:29', consumption: 4200, generation: -2800, net: 1400 },
  { time: '15:30', consumption: 4500, generation: -3200, net: 1300 },
  { time: '15:31', consumption: 4100, generation: -3100, net: 1000 },
  { time: '15:32', consumption: 3800, generation: -2900, net: 900 },
  { time: '15:33', consumption: 4300, generation: -3400, net: 900 },
  { time: '15:34', consumption: 4700, generation: -3600, net: 1100 },
  { time: '15:35', consumption: 4400, generation: -3300, net: 1100 },
  { time: '15:36', consumption: 4200, generation: -3100, net: 1100 },
  { time: '15:37', consumption: 4000, generation: -2800, net: 1200 },
  { time: '15:38', consumption: 4600, generation: -3500, net: 1100 },
  { time: '15:39', consumption: 4300, generation: -3200, net: 1100 }
];

// Device status distribution
const deviceStatusData = [
  { name: 'Online', value: 4, color: '#10b981' },
  { name: 'Offline', value: 1, color: '#6b7280' },
  { name: 'Warning', value: 1, color: '#f59e0b' },
  { name: 'Error', value: 0, color: '#ef4444' }
];

// Device type distribution
const deviceTypeData = [
  { name: 'Solar Panels', value: 1, color: '#3b82f6' },
  { name: 'Batteries', value: 1, color: '#8b5cf6' },
  { name: 'Heat Pumps', value: 1, color: '#06b6d4' },
  { name: 'EV Chargers', value: 1, color: '#84cc16' },
  { name: 'Smart Meters', value: 1, color: '#f97316' },
  { name: 'Inverters', value: 1, color: '#ec4899' }
];

const renderCustomLabel = ({ name, value }: { name: string; value: number }) => {
  return `${name}: ${value}`;
};

export function SystemMetricsCharts({ system }: SystemMetricsChartsProps) {
  return (
    <div className="space-y-6">
     
      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Status Distribution */}
        <Card className='rounded-sm'>
          <CardHeader>
            <CardTitle className="text-lg">Device Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={renderCustomLabel}
                  >
                    {deviceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Net Power Trend */}
        <Card className='rounded-sm'>
          <CardHeader>
            <CardTitle className="text-lg">Net Power Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={powerHistoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}W`, 'Net Power']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
