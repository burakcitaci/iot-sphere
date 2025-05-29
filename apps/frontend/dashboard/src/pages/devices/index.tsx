import React, { useState, useCallback, useMemo } from 'react';
import { Wifi, WifiOff, RefreshCw, Zap, Home, Battery, Thermometer } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FilterSection } from '@/components/common/FilterSection';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusBadge } from '@/components/common/StatusBadge';


// Interfaces
interface SubDevice {
  id: string;
  name: string;
  type: 'solar_panel' | 'battery' | 'heat_pump' | 'ev_charger' | 'smart_meter' | 'inverter';
  status: 'online' | 'offline' | 'warning' | 'error';
  powerConsumption: number; // in watts
  lastSeen: string;
  attributes?: Record<string, any>;
}

interface HemsSystem {
  id: string;
  customerName: string;
  systemName: string;
  location: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  totalPower: number;
  deviceCount: number;
  lastUpdate: string;
  subDevices: SubDevice[];
}

interface Customer {
  name: string;
  systemCount: number;
}

// Mock data
const mockHemsSystems: HemsSystem[] = [
  {
    id: "hems-001",
    customerName: "Johnson Family",
    systemName: "Home Energy Hub",
    location: "123 Oak Street, Berlin",
    status: "online",
    totalPower: 4500,
    deviceCount: 6,
    lastUpdate: "2 minutes ago",
    subDevices: [
      {
        id: "solar-001",
        name: "Rooftop Solar Array",
        type: "solar_panel",
        status: "online",
        powerConsumption: -2500, // negative = generating
        lastSeen: "1 minute ago",
        attributes: { efficiency: "94%", temperature: "45°C" }
      },
      {
        id: "battery-001",
        name: "Tesla Powerwall",
        type: "battery",
        status: "online",
        powerConsumption: 150,
        lastSeen: "1 minute ago",
        attributes: { charge: "85%", capacity: "13.5kWh" }
      },
      {
        id: "heatpump-001",
        name: "Air Source Heat Pump",
        type: "heat_pump",
        status: "online",
        powerConsumption: 1200,
        lastSeen: "2 minutes ago",
        attributes: { targetTemp: "22°C", mode: "heating" }
      },
      {
        id: "charger-001",
        name: "EV Charging Station",
        type: "ev_charger",
        status: "offline",
        powerConsumption: 0,
        lastSeen: "1 hour ago",
        attributes: { maxPower: "11kW", connectorType: "Type 2" }
      },
      {
        id: "meter-001",
        name: "Smart Electricity Meter",
        type: "smart_meter",
        status: "online",
        powerConsumption: 3800,
        lastSeen: "30 seconds ago",
        attributes: { totalConsumption: "450kWh", tariff: "dynamic" }
      },
      {
        id: "inverter-001",
        name: "SolarEdge Inverter",
        type: "inverter",
        status: "warning",
        powerConsumption: -2400,
        lastSeen: "5 minutes ago",
        attributes: { efficiency: "97.5%", temperature: "52°C" }
      }
    ]
  },
  {
    id: "hems-002",
    customerName: "Schmidt Residence",
    systemName: "Smart Home Pro",
    location: "456 Pine Avenue, Munich",
    status: "online",
    totalPower: 2800,
    deviceCount: 4,
    lastUpdate: "5 minutes ago",
    subDevices: [
      {
        id: "solar-002",
        name: "South Facing Panels",
        type: "solar_panel",
        status: "online",
        powerConsumption: -1800,
        lastSeen: "3 minutes ago",
        attributes: { efficiency: "91%", temperature: "43°C" }
      },
      {
        id: "battery-002",
        name: "Home Battery System",
        type: "battery",
        status: "online",
        powerConsumption: -200,
        lastSeen: "3 minutes ago",
        attributes: { charge: "92%", capacity: "10kWh" }
      },
      {
        id: "heatpump-002",
        name: "Ground Source Heat Pump",
        type: "heat_pump",
        status: "online",
        powerConsumption: 800,
        lastSeen: "4 minutes ago",
        attributes: { targetTemp: "21°C", mode: "auto" }
      },
      {
        id: "meter-002",
        name: "Grid Connection Meter",
        type: "smart_meter",
        status: "online",
        powerConsumption: 2200,
        lastSeen: "1 minute ago",
        attributes: { totalConsumption: "320kWh", tariff: "fixed" }
      }
    ]
  },
  {
    id: "hems-003",
    customerName: "Green Tech Office",
    systemName: "Commercial EMS",
    location: "789 Business Park, Hamburg",
    status: "error",
    totalPower: 8500,
    deviceCount: 8,
    lastUpdate: "1 hour ago",
    subDevices: [
      {
        id: "solar-003",
        name: "Commercial Solar Farm",
        type: "solar_panel",
        status: "error",
        powerConsumption: 0,
        lastSeen: "1 hour ago",
        attributes: { efficiency: "0%", temperature: "N/A" }
      },
      {
        id: "battery-003",
        name: "Industrial Battery Bank",
        type: "battery",
        status: "warning",
        powerConsumption: 500,
        lastSeen: "30 minutes ago",
        attributes: { charge: "45%", capacity: "50kWh" }
      }
    ]
  }
];

const mockCustomers: Customer[] = [
  { name: 'Johnson Family', systemCount: 1 },
  { name: 'Schmidt Residence', systemCount: 1 },
  { name: 'Green Tech Office', systemCount: 1 },
  { name: 'Miller Household', systemCount: 2 },
  { name: 'Weber Industries', systemCount: 3 }
];

// Device status distribution for pie chart
const deviceStatusData = [
  { name: 'Online', value: 12, color: '#10b981' },
  { name: 'Offline', value: 2, color: '#6b7280' },
  { name: 'Warning', value: 3, color: '#f59e0b' },
  { name: 'Error', value: 1, color: '#ef4444' }
];

// Power consumption over time
const powerHistogramData = [
  { time: '15:29', consumption: 4200, generation: -2800 },
  { time: '15:30', consumption: 4500, generation: -3200 },
  { time: '15:31', consumption: 4100, generation: -3100 },
  { time: '15:32', consumption: 3800, generation: -2900 },
  { time: '15:33', consumption: 4300, generation: -3400 },
  { time: '15:34', consumption: 4700, generation: -3600 },
  { time: '15:35', consumption: 4400, generation: -3300 },
  { time: '15:36', consumption: 4200, generation: -3100 },
  { time: '15:37', consumption: 4000, generation: -2800 },
  { time: '15:38', consumption: 4600, generation: -3500 },
  { time: '15:39', consumption: 4300, generation: -3200 }
];

const DeviceTypeIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "h-4 w-4" }) => {
  switch (type) {
    case 'solar_panel':
      return <Zap className={className} />;
    case 'battery':
      return <Battery className={className} />;
    case 'heat_pump':
      return <Thermometer className={className} />;
    case 'ev_charger':
    case 'smart_meter':
    case 'inverter':
    default:
      return <Home className={className} />;
  }
};

const PowerChart = () => (
  <div className="h-32">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium text-gray-700">Power Flow Over Time</h4>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
          <span>Consumption</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
          <span>Generation</span>
        </div>
        <span>Net: +1.2kW</span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={powerHistogramData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
        <CartesianGrid strokeDasharray="1 1" stroke="#f0f4f8" vertical={false} />
        <XAxis 
          dataKey="time" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#64748b' }}
          interval={2}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#64748b' }}
          width={35}
          tickFormatter={(value) => `${Math.abs(value/1000)}k`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            `${Math.abs(value)}W`,
            name === 'consumption' ? 'Consumption' : 'Generation'
          ]}
        />
        <Bar 
          dataKey="consumption" 
          fill="#60a5fa" 
          radius={[1, 1, 0, 0]}
        />
        <Bar 
          dataKey="generation" 
          fill="#34d399" 
          radius={[1, 1, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export function DeviceExplorer() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [selectedDeviceTypes, setSelectedDeviceTypes] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const filteredSystems = useMemo(() => {
    return mockHemsSystems.filter(system => {
      const matchesSearch = !searchQuery || 
        system.systemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCustomer = selectedCustomers.size === 0 || selectedCustomers.has(system.customerName);
      const matchesStatus = selectedStatuses.size === 0 || selectedStatuses.has(system.status);
      
      if (selectedDeviceTypes.size > 0) {
        const hasMatchingDevice = system.subDevices.some(device => selectedDeviceTypes.has(device.type));
        return matchesSearch && matchesCustomer && matchesStatus && hasMatchingDevice;
      }
      
      return matchesSearch && matchesCustomer && matchesStatus;
    });
  }, [searchQuery, selectedCustomers, selectedStatuses, selectedDeviceTypes]);

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const toggleCustomer = (customerName: string): void => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerName)) {
      newSelected.delete(customerName);
    } else {
      newSelected.add(customerName);
    }
    setSelectedCustomers(newSelected);
  };

  const toggleStatus = (status: string): void => {
    const newSelected = new Set(selectedStatuses);
    if (newSelected.has(status)) {
      newSelected.delete(status);
    } else {
      newSelected.add(status);
    }
    setSelectedStatuses(newSelected);
  };

  const toggleDeviceType = (deviceType: string): void => {
    const newSelected = new Set(selectedDeviceTypes);
    if (newSelected.has(deviceType)) {
      newSelected.delete(deviceType);
    } else {
      newSelected.add(deviceType);
    }
    setSelectedDeviceTypes(newSelected);
  };

  const stats = useMemo(() => {
    const totalSystems = filteredSystems.length;
    const totalDevices = filteredSystems.reduce((sum, system) => sum + system.deviceCount, 0);
    const onlineSystems = filteredSystems.filter(s => s.status === 'online').length;
    const totalPower = filteredSystems.reduce((sum, system) => sum + system.totalPower, 0);

    return { totalSystems, totalDevices, onlineSystems, totalPower };
  }, [filteredSystems]);

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Device Explorer"
          description="Monitor and manage HEMS devices and systems"
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Stats Bar */}
        <div className="flex gap-3 mb-3">
          <div className="bg-white rounded border border-gray-200 px-3 py-2">
            <div className="text-xs text-gray-500 mb-1">Total Systems</div>
            <div className="text-sm font-medium text-gray-800">{stats.totalSystems}</div>
          </div>
          <div className="bg-white rounded border border-gray-200 px-3 py-2">
            <div className="text-xs text-gray-500 mb-1">Online Systems</div>
            <div className="text-sm font-medium text-green-500">{stats.onlineSystems}</div>
          </div>
          <div className="bg-white rounded border border-gray-200 px-3 py-2">
            <div className="text-xs text-gray-500 mb-1">Total Devices</div>
            <div className="text-sm font-medium text-gray-800">{stats.totalDevices}</div>
          </div>
          <div className="bg-white rounded border border-gray-200 px-3 py-2">
            <div className="text-xs text-gray-500 mb-1">Total Power</div>
            <div className="text-sm font-medium text-blue-500">{(stats.totalPower/1000).toFixed(1)}kW</div>
          </div>
        </div>

        {/* Top Search and Controls */}
        <div className="bg-white rounded border border-gray-200 p-3 mb-3 shadow-sm">
          <SearchInput
            placeholder="Search systems, customers, locations..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-grow"
          />
        </div>

        {/* Main Content */}
        <div className="flex gap-3">
          {/* Left Sidebar - Filters */}
          <div className="w-60 bg-white rounded border border-gray-200 p-3 shadow-sm h-fit">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Filters</h3>
            
            <FilterSection title="Customers">
              <SearchInput
                placeholder="Search customers..."
                value={customerSearch}
                onChange={setCustomerSearch}
                className="mb-2"
              />
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {filteredCustomers.map(customer => (
                  <label key={customer.name} className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.has(customer.name)}
                        onChange={() => toggleCustomer(customer.name)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3 flex-shrink-0"
                      />
                      <span className="text-xs text-gray-700 truncate" title={customer.name}>
                        {customer.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2">
                      {customer.systemCount}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="System Status">
              <div className="space-y-1.5">
                {['online', 'offline', 'warning', 'error'].map(status => (
                  <label key={status} className="flex items-center gap-1.5">
                    <input 
                      type="checkbox" 
                      checked={selectedStatuses.has(status)}
                      onChange={() => toggleStatus(status)}
                      className="rounded border-gray-300 w-3 h-3" 
                    />
                    <span className="text-xs text-gray-700 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Device Types">
              <div className="space-y-1.5">
                {['solar_panel', 'battery', 'heat_pump', 'ev_charger', 'smart_meter', 'inverter'].map(type => (
                  <label key={type} className="flex items-center gap-1.5">
                    <input 
                      type="checkbox" 
                      checked={selectedDeviceTypes.has(type)}
                      onChange={() => toggleDeviceType(type)}
                      className="rounded border-gray-300 w-3 h-3" 
                    />
                    <DeviceTypeIcon type={type} className="h-3 w-3" />
                    <span className="text-xs text-gray-700">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>

          {/* Right Main Area */}
          <div className="flex-1">
            {/* Charts Section */}
            <div className="bg-white rounded border border-gray-200 p-4 mb-3 shadow-sm">
              <PowerChart />
            </div>

            {/* Systems Table */}
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  HEMS Systems ({filteredSystems.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        System
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Customer
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Location
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Power
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Devices
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                        Last Update
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500 text-xs">
                          Loading systems...
                        </td>
                      </tr>
                    ) : filteredSystems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500 text-xs">
                          No systems found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredSystems.map((system) => (
                        <tr
                          key={system.id}
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={system.status} />
                              <span className="text-xs font-medium text-gray-900">
                                {system.systemName}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-xs text-gray-700">
                              {system.customerName}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate">
                            {system.location}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-xs font-medium text-blue-600">
                              {(system.totalPower/1000).toFixed(1)}kW
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {system.deviceCount} devices
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                            {system.lastUpdate}
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
