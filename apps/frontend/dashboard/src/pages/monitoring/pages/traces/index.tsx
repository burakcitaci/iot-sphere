import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { FilterSection } from '@/components/common/FilterSection';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusBadge } from '@/components/common/StatusBadge';

// TypeScript interfaces
interface Span {
  id: number;
  date: string;
  service: string;
  resource: string;
  duration: string;
  method: string;
  statusCode: number;
  status: string;
}

interface Service {
  name: string;
  count: number;
}

interface ServiceItemProps {
  service: Service;
  isSelected: boolean;
  onToggle: () => void;
}

// Mock data for demonstration
const mockSpans: Span[] = [
  {
    id: 1,
    date: 'May 22 22:44:46.797',
    service: 'platform-api',
    resource: 'GET api.get.',
    duration: '583ms',
    method: 'GET',
    statusCode: 200,
    status: 'success'
  },
  {
    id: 2,
    date: 'May 22 22:44:45.234',
    service: 'auth-service',
    resource: 'POST /api/v1/auth/verify',
    duration: '125ms',
    method: 'POST',
    statusCode: 200,
    status: 'success'
  },
  {
    id: 3,
    date: 'May 22 22:44:44.156',
    service: 'payment-gateway',
    resource: 'GET /api/v2/payments/status',
    duration: '2.1s',
    method: 'GET',
    statusCode: 500,
    status: 'error'
  },
  {
    id: 4,
    date: 'May 22 22:44:43.892',
    service: 'user-service',
    resource: 'GET /api/v1/users/profile',
    duration: '89ms',
    method: 'GET',
    statusCode: 200,
    status: 'success'
  }
];

const mockServices: Service[] = [
  { name: 'dplatform-api', count: 45 },
  { name: 'auth-service', count: 32 },
  { name: 'payment-gateway', count: 18 },
  { name: 'user-service', count: 67 },
  { name: 'notification-service', count: 23 }
];

// Mock chart data
const requestsData = [
  { time: '13:15', requests: 1800 },
  { time: '13:20', requests: 1650 },
  { time: '13:25', requests: 1900 },
  { time: '13:30', requests: 1700 },
  { time: '13:35', requests: 1850 },
  { time: '13:40', requests: 1950 },
  { time: '13:45', requests: 2100 },
  { time: '13:50', requests: 2000 },
  { time: '13:55', requests: 2200 },
  { time: '14:00', requests: 2050 }
];

const errorsData = [
  { time: '13:15', '404': 2, '499': 1, '500': 0, others: 1 },
  { time: '13:20', '404': 1, '499': 2, '500': 1, others: 0 },
  { time: '13:25', '404': 3, '499': 1, '500': 0, others: 1 },
  { time: '13:30', '404': 2, '499': 3, '500': 1, others: 0 },
  { time: '13:35', '404': 1, '499': 2, '500': 0, others: 2 },
  { time: '13:40', '404': 4, '499': 1, '500': 1, others: 1 },
  { time: '13:45', '404': 2, '499': 4, '500': 0, others: 1 },
  { time: '13:50', '404': 3, '499': 2, '500': 1, others: 0 },
  { time: '13:55', '404': 1, '499': 3, '500': 2, others: 1 },
  { time: '14:00', '404': 5, '499': 1, '500': 0, others: 2 },
];

const latencyData = [
  { time: '13:15', p50: 45, p75: 89, p90: 156, p95: 234, p99: 445 },
  { time: '13:20', p50: 42, p75: 85, p90: 148, p95: 225, p99: 420 },
  { time: '13:25', p50: 48, p75: 92, p90: 165, p95: 248, p99: 465 },
  { time: '13:30', p50: 44, p75: 87, p90: 152, p95: 230, p99: 435 },
  { time: '13:35', p50: 46, p75: 90, p90: 158, p95: 238, p99: 450 },
  { time: '13:40', p50: 43, p75: 86, p90: 150, p95: 228, p99: 425 },
  { time: '13:45', p50: 47, p75: 91, p90: 162, p95: 242, p99: 460 },
  { time: '13:50', p50: 45, p75: 88, p90: 155, p95: 235, p99: 440 },
  { time: '13:55', p50: 49, p75: 94, p90: 168, p95: 252, p99: 475 },
  { time: '14:00', p50: 44, p75: 87, p90: 153, p95: 232, p99: 430 }
];

// Chart Components
const RequestsChart = () => (
  <div className="h-24">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-xs font-medium text-gray-600">Requests</h4>
      <span className="text-xs text-gray-500">51.4k total (57.1 req/s)</span>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={requestsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="time" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#6b7280' }}
          interval="preserveStartEnd"
        />
        <YAxis hide />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px',
            fontSize: '12px'
          }}
          labelStyle={{ fontSize: '11px', color: '#374151' }}
        />
        <Bar dataKey="requests" fill="#3b82f6" radius={[1, 1, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const ErrorsChart = () => (
  <div className="h-24">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-xs font-medium text-gray-600">Errors</h4>
      <span className="text-xs text-gray-500">76 total (0.15%)</span>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={errorsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="time" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#6b7280' }}
          interval="preserveStartEnd"
        />
        <YAxis hide />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px',
            fontSize: '12px'
          }}
          labelStyle={{ fontSize: '11px', color: '#374151' }}
        />
        <Bar dataKey="404" stackId="a" fill="#7c2d12" />
        <Bar dataKey="499" stackId="a" fill="#dc2626" />
        <Bar dataKey="500" stackId="a" fill="#f87171" />
        <Bar dataKey="others" stackId="a" fill="#fca5a5" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const LatencyChart = () => (
  <div className="h-24">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-xs font-medium text-gray-600">Latency</h4>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-gray-500">p50</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="text-xs text-gray-500">p75</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-gray-500">p90</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
          <span className="text-xs text-gray-500">p95</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-xs text-gray-500">p99</span>
        </div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={latencyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="time" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#6b7280' }}
          interval="preserveStartEnd"
        />
        <YAxis hide />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px',
            fontSize: '12px'
          }}
          labelStyle={{ fontSize: '11px', color: '#374151' }}
          formatter={(value) => [`${value}ms`, '']}
        />
        <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="p75" stroke="#8b5cf6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="p90" stroke="#eab308" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="p95" stroke="#0ea5e9" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="p99" stroke="#6b7280" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Service Filter Item
const ServiceItem: React.FC<ServiceItemProps> = ({ service, isSelected, onToggle }) => (
  <label className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3 flex-shrink-0"
      />
      <span className="text-xs text-gray-700 truncate" title={service.name}>
        {service.name}
      </span>
    </div>
    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2">
      {service.count}
    </span>
  </label>
);

// Main TraceExplorer Component
export function TraceExplorer() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);

  const filteredSpans = mockSpans.filter(span => {
    const matchesSearch = span.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         span.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = selectedServices.size === 0 || selectedServices.has(span.service);
    return matchesSearch && matchesService;
  });

  const filteredServices = mockServices.filter(service =>
    service.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const toggleService = (serviceName: string): void => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceName)) {
      newSelected.delete(serviceName);
    } else {
      newSelected.add(serviceName);
    }
    setSelectedServices(newSelected);
  };

  return (
    <div className="px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-900 mb-1">Distributed Tracing</h1>
            <p className="text-gray-600 text-xs">Monitor and analyze your application traces</p>
          </div>

          {/* Top Search and Controls */}
          <div className="bg-white rounded border border-gray-200 p-3 mb-3 shadow-sm">
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder="Search for traces..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="flex-grow"
              />
              <button className="flex items-center gap-1.5 bg-blue-600 text-white rounded px-3 py-1.5 text-xs hover:bg-blue-700 transition-colors shadow-sm">
                <Plus className="h-3 w-3" />
                Add Span Query
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-3">
            {/* Left Sidebar - Filters */}
            <div className="w-60 bg-white rounded border border-gray-200 p-3 shadow-sm h-fit">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">Filters</h3>
              
              <FilterSection title="Services">
                <SearchInput
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={setServiceSearch}
                  className="mb-2"
                />
                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  {filteredServices.map(service => (
                    <ServiceItem
                      key={service.name}
                      service={service}
                      isSelected={selectedServices.has(service.name)}
                      onToggle={() => toggleService(service.name)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Duration">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded border-gray-300 w-3 h-3" />
                    <span className="text-xs text-gray-700">&lt; 100ms</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded border-gray-300 w-3 h-3" />
                    <span className="text-xs text-gray-700">100ms - 1s</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded border-gray-300 w-3 h-3" />
                    <span className="text-xs text-gray-700">&gt; 1s</span>
                  </label>
                </div>
              </FilterSection>

              <FilterSection title="Status">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded border-gray-300 w-3 h-3" />
                    <span className="text-xs text-gray-700">Success (2xx)</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded border-gray-300 w-3 h-3" />
                    <span className="text-xs text-gray-700">Error (4xx, 5xx)</span>
                  </label>
                </div>
              </FilterSection>
            </div>

            {/* Right Main Area */}
            <div className="flex-1">
              {/* Charts Section */}
              <div className="bg-white rounded border border-gray-200 p-3 mb-3 shadow-sm">
                <h3 className="text-sm font-semibold mb-3 text-gray-900">Performance Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <RequestsChart />
                  <ErrorsChart />
                  <LatencyChart />
                </div>
              </div>

              {/* Spans Table */}
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Spans ({filteredSpans.length})
                  </h3>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Timestamp
                      </TableHead>
                      <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Service
                      </TableHead>
                      <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Resource
                      </TableHead>
                      <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Duration
                      </TableHead>
                      <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Method
                      </TableHead>
                      <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSpans.map((span) => (
                      <TableRow
                        key={span.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedSpan?.id === span.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedSpan(span)}
                      >
                        <TableCell className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                          {span.date}
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {span.service}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs text-gray-900 max-w-xs truncate">
                          {span.resource}
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap text-xs">
                          <span className={span.duration.includes('s') && !span.duration.includes('ms') ? 'text-red-600' : 'text-gray-900'}>
                            {span.duration}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                            span.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            span.method === 'POST' ? 'bg-green-100 text-green-800' :
                            span.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {span.method}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap">
                          <StatusBadge status={span.statusCode.toString()} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredSpans.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-xs">No spans found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}