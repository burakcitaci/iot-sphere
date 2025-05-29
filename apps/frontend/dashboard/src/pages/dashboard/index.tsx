import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Percent,
  Filter,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterSection } from '@/components/common/FilterSection';
import { SearchInput } from '@/components/common/SearchInput';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';

// Mock data matching the original dashboard
const performanceData = [
  { date: 'Apr 27', value: 2800 },
  { date: 'Apr 30', value: 2600 },
  { date: 'May 3', value: 3200 },
  { date: 'May 6', value: 3800 },
  { date: 'May 9', value: 3400 },
  { date: 'May 12', value: 4200 },
  { date: 'May 15', value: 3900 },
  { date: 'May 18', value: 3600 },
  { date: 'May 21', value: 3800 },
  { date: 'May 24', value: 3500 }
];

const projects = [
  { header: 'Max Mustermann', sectionType: 'SmartHub-V1', status: 'In Process', reviewer: 'Eddie Lake' },
  { header: 'Sarah Johnson', sectionType: 'SmartHub-V2', status: 'Completed', reviewer: 'Maria Chen' },
  { header: 'John Smith', sectionType: 'SmartHub-V1', status: 'Review', reviewer: 'Alex Turner' },
  { header: 'Lisa Wong', sectionType: 'SmartHub-V2', status: 'In Process', reviewer: 'Maria Chen' }
];

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const toggleStatus = (status:any) => {
    const newSelected = new Set(selectedStatuses);
    if (newSelected.has(status)) {
      newSelected.delete(status);
    } else {
      newSelected.add(status);
    }
    setSelectedStatuses(newSelected);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.header.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.sectionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.reviewer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatuses.size === 0 || selectedStatuses.has(project.status);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalProjects: filteredProjects.length,
    completedProjects: filteredProjects.filter(p => p.status === 'Completed').length,
    inProgressProjects: filteredProjects.filter(p => p.status === 'In Process').length
  };

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="IoT Hub Dashboard"
          description="Monitor your IoT infrastructure performance and metrics"
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Stats Bar */}
        <div className="flex gap-3 mb-3">
          <StatCard
            title="New Customers"
            value="1,234"
            change="-20%"
            icon={Users}
            isNegative={true}
          />
          <StatCard
            title="Active Accounts" 
            value="45,678"
            change="+12.5%"
            icon={Activity}
            isNegative={false}
          />
          <StatCard
            title="Growth Rate"
            value="4.5%"
            change="+4.5%"
            icon={Percent}
            isNegative={false}
          />
          <StatCard
            title="Total Projects"
            value={stats.totalProjects.toString()}
            icon={Activity}
          />
          <StatCard
            title="Completed"
            value={stats.completedProjects.toString()}
            icon={Activity}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressProjects.toString()}
            icon={Activity}
          />
        </div>

        {/* Top Search and Controls */}
        <div className="bg-white rounded border border-gray-200 p-3 mb-3 shadow-sm">
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Search projects, users, or metrics..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="flex-grow"
            />
            <button className="flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-800 rounded px-3 py-1.5 text-xs hover:bg-gray-200 transition-colors">
              <Filter className="h-3 w-3" />
              Filter
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-100 border border-gray-200 text-gray-800 rounded px-3 py-1.5 text-xs hover:bg-gray-200 transition-colors"
            >
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 30 days">Last 30 days</option>
              <option value="Last 3 months">Last 3 months</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-3">
          {/* Left Sidebar - Filters */}
          <div className="w-60 bg-white rounded border border-gray-200 p-3 shadow-sm h-fit">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Filters</h3>
            
            <FilterSection title="Project Status">
              <div className="space-y-1.5">
                {['In Process', 'Completed', 'Review'].map(status => (
                  <label key={status} className="flex items-center gap-1.5">
                    <input 
                      type="checkbox" 
                      checked={selectedStatuses.has(status)}
                      onChange={() => toggleStatus(status)}
                      className="rounded border-gray-300 w-3 h-3" 
                    />
                    <span className="text-xs text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Time Range">
              <div className="space-y-1.5">
                {['Last 7 days', 'Last 30 days', 'Last 3 months'].map(range => (
                  <label key={range} className="flex items-center gap-1.5">
                    <input 
                      type="radio" 
                      name="timeRange"
                      checked={timeRange === range}
                      onChange={() => setTimeRange(range)}
                      className="w-3 h-3" 
                    />
                    <span className="text-xs text-gray-700">{range}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Hub Types">
              <div className="space-y-1.5">
                {['SmartHub-V1', 'SmartHub-V2', 'SmartHub-V3'].map(type => (
                  <label key={type} className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded border-gray-300 w-3 h-3" />
                    <span className="text-xs text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>

          {/* Right Main Area */}
          <div className="flex-1">
            {/* Performance Chart */}
            <div className="bg-white rounded border border-gray-200 p-4 mb-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">IoT Hub Performance</h4>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                    <span>Performance</span>
                  </div>
                  <span>Peak: 4.2k</span>
                </div>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="1 1" stroke="#f0f4f8" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#64748b' }}
                      interval={1}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#64748b' }}
                      width={35}
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
                      formatter={(value) => [value, 'Performance']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#60a5fa" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPerformance)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  Projects ({filteredProjects.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Header
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Section Type
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Reviewer
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500 text-xs">
                          Loading projects...
                        </td>
                      </tr>
                    ) : filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500 text-xs">
                          No projects found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((project, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-xs font-medium text-gray-900">
                              {project.header}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {project.sectionType}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <StatusBadge status={project.status} />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-xs text-gray-700">
                              {project.reviewer}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}