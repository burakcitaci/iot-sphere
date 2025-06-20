import React, { useState, useCallback, useMemo } from 'react';
import { Wifi, WifiOff, RefreshCw, Zap, Home, Battery, Thermometer, Plus } from 'lucide-react';
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

import { Button } from '@/components/ui/button';
import { FilterSection } from '@/components/common/FilterSection';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CreateHemsSystemForm } from '@/components/CreateHemSystemForm';
import { DeviceDataTable } from '@/components/DeviceDataTable';
import { HemsSystemDataTable } from '@/components/HemsSystemDataTable';

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
      },
      {
        id: "heatpump-003",
        name: "Commercial HVAC System",
        type: "heat_pump",
        status: "online",
        powerConsumption: 3500,
        lastSeen: "45 minutes ago",
        attributes: { targetTemp: "20°C", mode: "cooling" }
      },
      {
        id: "charger-003",
        name: "Fleet Charging Hub",
        type: "ev_charger",
        status: "online",
        powerConsumption: 2200,
        lastSeen: "15 minutes ago",
        attributes: { maxPower: "50kW", connectorType: "CCS" }
      },
      {
        id: "meter-003",
        name: "Main Grid Meter",
        type: "smart_meter",
        status: "online",
        powerConsumption: 8500,
        lastSeen: "45 minutes ago",
        attributes: { totalConsumption: "1250kWh", tariff: "commercial" }
      },
      {
        id: "inverter-003",
        name: "Central Inverter System",
        type: "inverter",
        status: "error",
        powerConsumption: 0,
        lastSeen: "1 hour ago",
        attributes: { efficiency: "0%", temperature: "N/A" }
      },
      {
        id: "lighting-003",
        name: "Smart LED System",
        type: "smart_meter",
        status: "online",
        powerConsumption: 800,
        lastSeen: "20 minutes ago",
        attributes: { brightness: "75%", schedule: "auto" }
      },
      {
        id: "server-003",
        name: "Data Center UPS",
        type: "battery",
        status: "online",
        powerConsumption: 1500,
        lastSeen: "10 minutes ago",
        attributes: { batteryLevel: "98%", loadPercentage: "65%" }
      }
    ]
  },
  {
    id: "hems-004",
    customerName: "Müller Villa",
    systemName: "Luxury Home Energy",
    location: "321 Riverside Drive, Frankfurt",
    status: "online",
    totalPower: 6200,
    deviceCount: 7,
    lastUpdate: "3 minutes ago",
    subDevices: [
      {
        id: "solar-004",
        name: "Premium Solar Installation",
        type: "solar_panel",
        status: "online",
        powerConsumption: -3200,
        lastSeen: "2 minutes ago",
        attributes: { efficiency: "96%", temperature: "41°C" }
      },
      {
        id: "battery-004",
        name: "Tesla Powerwall 2x",
        type: "battery",
        status: "online",
        powerConsumption: 300,
        lastSeen: "2 minutes ago",
        attributes: { charge: "78%", capacity: "27kWh" }
      },
      {
        id: "heatpump-004",
        name: "Geothermal Heat Pump",
        type: "heat_pump",
        status: "online",
        powerConsumption: 950,
        lastSeen: "3 minutes ago",
        attributes: { targetTemp: "23°C", mode: "heating" }
      },
      {
        id: "charger-004",
        name: "Dual EV Charger",
        type: "ev_charger",
        status: "online",
        powerConsumption: 7400,
        lastSeen: "1 minute ago",
        attributes: { maxPower: "22kW", connectorType: "Type 2" }
      },
      {
        id: "pool-004",
        name: "Smart Pool System",
        type: "smart_meter",
        status: "online",
        powerConsumption: 1200,
        lastSeen: "5 minutes ago",
        attributes: { temperature: "26°C", pumpSpeed: "medium" }
      },
      {
        id: "meter-004",
        name: "Bi-directional Meter",
        type: "smart_meter",
        status: "online",
        powerConsumption: 6200,
        lastSeen: "1 minute ago",
        attributes: { totalConsumption: "680kWh", tariff: "time-of-use" }
      },
      {
        id: "inverter-004",
        name: "Hybrid Inverter System",
        type: "inverter",
        status: "online",
        powerConsumption: -3100,
        lastSeen: "2 minutes ago",
        attributes: { efficiency: "98.2%", temperature: "48°C" }
      }
    ]
  },
  {
    id: "hems-005",
    customerName: "Weber Apartment",
    systemName: "Compact Smart Home",
    location: "88 Urban Street, Stuttgart",
    status: "online",
    totalPower: 1800,
    deviceCount: 4,
    lastUpdate: "1 minute ago",
    subDevices: [
      {
        id: "solar-005",
        name: "Balcony Solar Kit",
        type: "solar_panel",
        status: "online",
        powerConsumption: -600,
        lastSeen: "1 minute ago",
        attributes: { efficiency: "89%", temperature: "38°C" }
      },
      {
        id: "battery-005",
        name: "Compact Home Battery",
        type: "battery",
        status: "online",
        powerConsumption: 80,
        lastSeen: "1 minute ago",
        attributes: { charge: "67%", capacity: "5kWh" }
      },
      {
        id: "heatpump-005",
        name: "Mini Split Heat Pump",
        type: "heat_pump",
        status: "online",
        powerConsumption: 750,
        lastSeen: "2 minutes ago",
        attributes: { targetTemp: "21°C", mode: "auto" }
      },
      {
        id: "meter-005",
        name: "Apartment Smart Meter",
        type: "smart_meter",
        status: "online",
        powerConsumption: 1800,
        lastSeen: "30 seconds ago",
        attributes: { totalConsumption: "180kWh", tariff: "standard" }
      }
    ]
  }
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

export function DeviceExplorer() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [selectedDeviceTypes, setSelectedDeviceTypes] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState<boolean>(false);
  const [hemsSystems, setHemsSystems] = useState<HemsSystem[]>(mockHemsSystems);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleCreateSystem = useCallback((newSystem: HemsSystem) => {
    setHemsSystems(prev => [...prev, newSystem]);
  }, []);

  const filteredSystems = useMemo(() => {
    return hemsSystems.filter(system => {
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
  }, [searchQuery, selectedCustomers, selectedStatuses, selectedDeviceTypes, hemsSystems]);

  // Update customers list to include new ones
  const allCustomers = useMemo(() => {
    const customerMap = new Map<string, number>();
    hemsSystems.forEach(system => {
      customerMap.set(system.customerName, (customerMap.get(system.customerName) || 0) + 1);
    });
    return Array.from(customerMap.entries()).map(([name, systemCount]) => ({ name, systemCount }));
  }, [hemsSystems]);

  const filteredCustomers = allCustomers.filter(customer =>
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
        <div>
          <PageHeader
            title="Device Explorer"
            description="Monitor and manage HEMS devices and systems"
            autoRefresh={autoRefresh}
            onAutoRefreshChange={setAutoRefresh}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
         
        </div>
        
        {/* Stats Bar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex gap-3">
          <div className="bg-white rounded border border-gray-200 px-3 py-2">
            <div className="text-md text-gray-500 mb-1">Total Systems</div>
            <div className="text-sm font-medium text-gray-800">{stats.totalSystems}</div>
          </div>
          <div className="bg-white rounded border border-gray-200 px-3 py-2">
            <div className="text-md text-gray-500 mb-1">Online Systems</div>
            <div className="text-sm font-medium text-green-500">{stats.onlineSystems}</div>
          </div>
          <div className="bg-white rounded border border-gray-200 px-3 py-2">
            <div className="text-md text-gray-500 mb-1">Total Devices</div>
            <div className="text-sm font-medium text-gray-800">{stats.totalDevices}</div>
          </div>
          <div className="bg-white rounded border border-gray-200 px-3 py-2">
            <div className="text-md text-gray-500 mb-1">Total Power</div>
            <div className="text-sm font-medium text-blue-500">{(stats.totalPower/1000).toFixed(1)}kW</div>
          </div>
          </div>
          
          <Button
            onClick={() => setIsCreateFormOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create HEMS System
          </Button>
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
                    <span className="text-sm text-gray-700 capitalize">{status}</span>
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
                    <span className="text-sm text-gray-700">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>

          {/* Right Main Area */}
          <div className="flex-1">
           <HemsSystemDataTable data={filteredSystems} />
          </div>
        </div>

        <CreateHemsSystemForm
          isOpen={isCreateFormOpen}
          onClose={() => setIsCreateFormOpen(false)}
          onSubmit={handleCreateSystem}
        />
      </div>
    </div>
  );
}