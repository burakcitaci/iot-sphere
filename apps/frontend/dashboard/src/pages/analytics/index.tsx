import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Zap, Home, AlertTriangle, TrendingUp, Battery, Sun, Thermometer, Car, Activity, Settings, RefreshCw, Filter, Wifi, WifiOff } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';


export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Sample data for charts
  const powerFlowData = [
    { time: '15:29', consumption: 4800, generation: 2100 },
    { time: '15:30', consumption: 4900, generation: 2200 },
    { time: '15:31', consumption: 4700, generation: 2300 },
    { time: '15:32', consumption: 4600, generation: 2100 },
    { time: '15:33', consumption: 4800, generation: 2400 },
    { time: '15:34', consumption: 5000, generation: 2200 },
    { time: '15:35', consumption: 4900, generation: 2300 },
    { time: '15:36', consumption: 4700, generation: 2100 },
    { time: '15:37', consumption: 4800, generation: 2200 },
    { time: '15:38', consumption: 4600, generation: 2300 }
  ];

  const deviceStatusData = [
    { date: 'Apr 29', online: 16, offline: 2 },
    { date: 'May 1', online: 17, offline: 1 },
    { date: 'May 5', online: 15, offline: 3 },
    { date: 'May 8', online: 18, offline: 0 },
    { date: 'May 11', online: 16, offline: 2 },
    { date: 'May 14', online: 17, offline: 1 },
    { date: 'May 17', online: 18, offline: 0 },
    { date: 'May 20', online: 15, offline: 3 },
    { date: 'May 24', online: 16, offline: 2 }
  ];

  const deviceTypeData = [
    { name: 'Solar Panel', value: 44, count: 8, color: '#3B82F6' },
    { name: 'Smart Meter', value: 17, count: 3, color: '#F59E0B' },
    { name: 'Battery', value: 17, count: 3, color: '#EF4444' },
    { name: 'Heat Pump', value: 11, count: 2, color: '#10B981' },
    { name: 'EV Charger', value: 6, count: 1, color: '#8B5CF6' },
    { name: 'Inverter', value: 6, count: 1, color: '#F97316' }
  ];

  const systemPerformanceData = [
    { system: 'Home Energy Hub', efficiency: 94, power: '4.5kW', status: 'Online' },
    { system: 'Smart Home Pro', efficiency: 91, power: '2.8kW', status: 'Online' },
    { system: 'Commercial EMS', efficiency: 0, power: '8.5kW', status: 'Error' }
  ];

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Analytics"
          description="Monitor and analyze your HEMS devices and energy systems"
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Top Stats */}
        <div className="flex gap-3 mb-3">
          <StatCard 
            title="Total Devices" 
            value="18" 
            icon={Activity}
            description="6 device types"
          />
          <StatCard 
            title="Online Systems" 
            value="2" 
            icon={Zap}
            description="66% operational"
          />
          <StatCard 
            title="Total Power" 
            value="15.8kW" 
            icon={Battery}
            description="Net: +1.2kW"
          />
          <StatCard 
            title="System Alerts" 
            value="1" 
            icon={AlertTriangle}
            description="Commercial EMS"
            isNegative={true}
          />
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded border border-gray-200 p-3 mb-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-800 rounded px-3 py-1.5 text-xs hover:bg-gray-200 transition-colors">
              <Filter className="h-3 w-3" />
              Filter
            </button>
            <select 
              className="bg-gray-100 border border-gray-200 text-gray-800 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button className="flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-800 rounded px-3 py-1.5 text-xs hover:bg-gray-200 transition-colors">
              <Settings className="h-3 w-3" />
              Settings
            </button>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          {/* Power Flow Chart */}
          <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Power Flow Over Time</h3>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-sm mr-1"></div>
                  <span className="text-gray-600">Consumption</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-sm mr-1"></div>
                  <span className="text-gray-600">Generation</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={powerFlowData}>
                  <CartesianGrid strokeDasharray="1 1" stroke="#f0f4f8" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(value) => `${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [`${value}W`, name === 'consumption' ? 'Consumption' : 'Generation']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="consumption" 
                    stackId="1"
                    stroke="#60a5fa" 
                    fill="#60a5fa" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="generation" 
                    stackId="2"
                    stroke="#34d399" 
                    fill="#34d399" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device Types Distribution */}
          <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Device Types Distribution</h3>
            <div className="flex items-center justify-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                    >
                      {deviceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [`${value}%`, name]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-4">
              {deviceTypeData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.name} ({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Status Over Time */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm mb-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Device Status Over Time</h3>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-sm mr-1"></div>
                <span className="text-gray-600">Online</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-sm mr-1"></div>
                <span className="text-gray-600">Offline</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={deviceStatusData}>
                <CartesianGrid strokeDasharray="1 1" stroke="#f0f4f8" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="online" 
                  stackId="1"
                  stroke="#34d399" 
                  fill="#34d399" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="offline" 
                  stackId="1"
                  stroke="#f87171" 
                  fill="#f87171" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Performance Table */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">System Performance Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">System</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">Power</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">Efficiency</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">Devices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {systemPerformanceData.map((system, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{system.system}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={system.status} />
                    </td>
                    <td className="px-4 py-3 text-blue-600 font-medium text-sm">{system.power}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                          <div 
                            className={`h-2 rounded-full ${
                              system.efficiency > 90 ? 'bg-green-500' : 
                              system.efficiency > 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${system.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{system.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {index === 0 ? '6 devices' : index === 1 ? '4 devices' : '8 devices'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}