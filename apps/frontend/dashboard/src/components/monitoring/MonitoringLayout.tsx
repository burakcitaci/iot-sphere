import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Activity, 
  BarChart3, 
  FileText, 
  GitBranch, 
  Search,
  Clock,
  Filter,
  Settings,
  RefreshCw,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MonitoringLayoutProps {
  children?: React.ReactNode;
}

const monitoringTabs = [
  { id: 'logs', label: 'Logs', icon: FileText, path: '/monitoring/logs' },
  { id: 'traces', label: 'Traces', icon: GitBranch, path: '/monitoring/traces' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, path: '/monitoring/metrics' },
];

const timeRanges = [
  { value: '5m', label: 'Last 5 minutes' },
  { value: '15m', label: 'Last 15 minutes' },
  { value: '1h', label: 'Last hour' },
  { value: '4h', label: 'Last 4 hours' },
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: 'custom', label: 'Custom range' }
];

export const MonitoringLayout: React.FC<MonitoringLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState('');
  const [timeRange, setTimeRange] = useState('15m');
  const [isLive, setIsLive] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const currentTab = monitoringTabs.find(tab => 
    location.pathname.startsWith(tab.path)
  )?.id || 'logs';

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Global Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Monitoring</h1>
              <p className="text-sm text-gray-600 mt-1">
                Unified observability across logs, traces, and metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isLive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className="h-8"
              >
                <Activity className={`h-4 w-4 mr-2 ${isLive ? 'animate-pulse' : ''}`} />
                {isLive ? 'Live' : 'Paused'}
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Global Search and Controls */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search across all telemetry data..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 h-9">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Calendar className="h-4 w-4 mr-2" />
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Custom Time Range</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-gray-600">From</label>
                      <Input type="datetime-local" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">To</label>
                      <Input type="datetime-local" className="mt-1" />
                    </div>
                  </div>
                  <Button className="w-full" size="sm">Apply Range</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {monitoringTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              
              return (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Global Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Service:</label>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  <SelectItem value="coffee-house">coffee-house</SelectItem>
                  <SelectItem value="payment-service">payment-service</SelectItem>
                  <SelectItem value="auth-service">auth-service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Environment:</label>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All envs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All environments</SelectItem>
                  <SelectItem value="prod">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="dev">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children || <Outlet />}
      </div>
    </div>
  );
}; 