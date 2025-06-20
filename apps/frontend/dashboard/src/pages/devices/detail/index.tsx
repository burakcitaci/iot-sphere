import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wifi, WifiOff, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemOverviewStats } from '@/components/SystemOverviewStats';
import { SystemMetricsCharts } from '@/components/SystemMetricsChart';
import { SubDevicesList } from '@/components/SubDevicesList';


// Mock data - in a real app this would come from an API
const mockHemsSystems = [
  {
    id: "hems-001",
    customerName: "Johnson Family",
    systemName: "Home Energy Hub",
    location: "123 Oak Street, Berlin",
    status: "online" as const,
    totalPower: 4500,
    deviceCount: 6,
    lastUpdate: "2 minutes ago",
    subDevices: [
      {
        id: "solar-001",
        name: "Rooftop Solar Array",
        type: "solar_panel" as const,
        status: "online" as const,
        powerConsumption: -2500,
        lastSeen: "1 minute ago",
        attributes: { efficiency: "94%", temperature: "45°C" }
      },
      {
        id: "battery-001",
        name: "Tesla Powerwall",
        type: "battery" as const,
        status: "online" as const,
        powerConsumption: 150,
        lastSeen: "1 minute ago",
        attributes: { charge: "85%", capacity: "13.5kWh" }
      },
      {
        id: "heatpump-001",
        name: "Air Source Heat Pump",
        type: "heat_pump" as const,
        status: "online" as const,
        powerConsumption: 1200,
        lastSeen: "2 minutes ago",
        attributes: { targetTemp: "22°C", mode: "heating" }
      },
      {
        id: "charger-001",
        name: "EV Charging Station",
        type: "ev_charger" as const,
        status: "offline" as const,
        powerConsumption: 0,
        lastSeen: "1 hour ago",
        attributes: { maxPower: "11kW", connectorType: "Type 2" }
      },
      {
        id: "meter-001",
        name: "Smart Electricity Meter",
        type: "smart_meter" as const,
        status: "online" as const,
        powerConsumption: 3800,
        lastSeen: "30 seconds ago",
        attributes: { totalConsumption: "450kWh", tariff: "dynamic" }
      },
      {
        id: "inverter-001",
        name: "SolarEdge Inverter",
        type: "inverter" as const,
        status: "warning" as const,
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
    status: "online" as const,
    totalPower: 2800,
    deviceCount: 4,
    lastUpdate: "5 minutes ago",
    subDevices: [
      {
        id: "solar-002",
        name: "South Facing Panels",
        type: "solar_panel" as const,
        status: "online" as const,
        powerConsumption: -1800,
        lastSeen: "3 minutes ago",
        attributes: { efficiency: "91%", temperature: "43°C" }
      },
      {
        id: "battery-002",
        name: "Home Battery System",
        type: "battery" as const,
        status: "online" as const,
        powerConsumption: -200,
        lastSeen: "3 minutes ago",
        attributes: { charge: "92%", capacity: "10kWh" }
      },
      {
        id: "heatpump-002",
        name: "Ground Source Heat Pump",
        type: "heat_pump" as const,
        status: "online" as const,
        powerConsumption: 800,
        lastSeen: "4 minutes ago",
        attributes: { targetTemp: "21°C", mode: "auto" }
      },
      {
        id: "meter-002",
        name: "Grid Connection Meter",
        type: "smart_meter" as const,
        status: "online" as const,
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
    status: "error" as const,
    totalPower: 8500,
    deviceCount: 8,
    lastUpdate: "1 hour ago",
    subDevices: [
      {
        id: "solar-003",
        name: "Commercial Solar Farm",
        type: "solar_panel" as const,
        status: "error" as const,
        powerConsumption: 0,
        lastSeen: "1 hour ago",
        attributes: { efficiency: "0%", temperature: "N/A" }
      },
      {
        id: "battery-003",
        name: "Industrial Battery Bank",
        type: "battery" as const,
        status: "warning" as const,
        powerConsumption: 500,
        lastSeen: "30 minutes ago",
        attributes: { charge: "45%", capacity: "50kWh" }
      }
    ]
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online':
      return <Wifi className="w-4 h-4 text-green-500" />;
    case 'offline':
      return <WifiOff className="w-4 h-4 text-gray-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'error':
      return <X className="w-4 h-4 text-red-500" />;
    default:
      return <WifiOff className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'offline':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const system = mockHemsSystems.find(s => s.id === id);

  if (!system) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded border border-gray-200 px-6 py-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">System Not Found</h1>
          <p className="text-gray-600 mb-4 text-sm">The HEMS system you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/devices')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Device Explorer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
      <Button
            variant="ghost"
            onClick={() => navigate('/devices')}
            className="mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Device Explorer
          </Button>
          
        {/* Header Section */}
        <div className="border border-gray-200 p-3 mb-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 mb-1 truncate">{system.systemName}</h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="truncate">{system.customerName}</span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate">{system.location}</span>
                <span className="hidden sm:inline">•</span>
                <span className="whitespace-nowrap">Last updated {system.lastUpdate}</span>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium self-start sm:self-auto ${getStatusColor(system.status)}`}>
              {getStatusIcon(system.status)}
              <span className="capitalize">{system.status}</span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white rounded border border-gray-200 px-3 py-2 shadow-sm">
            <div className="text-md text-gray-500 mb-1">Total Power</div>
            <div className="text-sm font-medium text-gray-800">{(system.totalPower/1000).toFixed(1)}kW</div>
          </div>
          <div className="bg-white rounded border border-gray-200 px-3 py-2 shadow-sm">
            <div className="text-md text-gray-500 mb-1">Active Devices</div>
            <div className="text-sm font-medium text-green-500">
              {system.subDevices.filter(d => d.status === 'online').length}/{system.deviceCount}
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 px-3 py-2 shadow-sm">
            <div className="text-md text-gray-500 mb-1">Net Generation</div>
            <div className="text-sm font-medium text-green-600">
              {(Math.abs(system.subDevices
                .filter(d => d.powerConsumption < 0)
                .reduce((sum, d) => sum + d.powerConsumption, 0))/1000).toFixed(1)}kW
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 px-3 py-2 shadow-sm">
            <div className="text-md text-gray-500 mb-1">Total Consumption</div>
            <div className="text-sm font-medium text-blue-600">
              {(system.subDevices
                .filter(d => d.powerConsumption > 0)
                .reduce((sum, d) => sum + d.powerConsumption, 0)/1000).toFixed(1)}kW
            </div>
          </div>
        </div>

       
        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-3 mb-3">
          {/* Charts Section */}
          <div className="flex-1 min-w-0">
            <div>
              <SystemMetricsCharts system={system} />
            </div>
          </div>
          
        </div>

        {/* Sub Devices */}
        <div>
          <SubDevicesList devices={system.subDevices} />
        </div>
      </div>
    </div>
  );
}