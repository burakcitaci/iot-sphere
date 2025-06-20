import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Battery,
  Thermometer,
  Home,
  Wifi,
  WifiOff,
  AlertTriangle,
  X,
} from 'lucide-react';

interface SubDevice {
  id: string;
  name: string;
  type:
    | 'solar_panel'
    | 'battery'
    | 'heat_pump'
    | 'ev_charger'
    | 'smart_meter'
    | 'inverter';
  status: 'online' | 'offline' | 'warning' | 'error';
  powerConsumption: number;
  lastSeen: string;
  attributes?: Record<string, any>;
}

interface SubDevicesListProps {
  devices: SubDevice[];
}

const DeviceTypeIcon = ({
  type,
  className = 'h-5 w-5',
}: {
  type: string;
  className?: string;
}) => {
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
      return 'bg-green-50 text-green-700 border-green-200';
    case 'offline':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    case 'warning':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'error':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export function SubDevicesList({ devices }: SubDevicesListProps) {
  return (
    <div>
      <div className="text-xl font-bold mb-3">
        Connected Devices ({devices.length})
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <Card key={device.id} className="border-1 rounded-sm">
            <CardContent className="px-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DeviceTypeIcon
                    type={device.type}
                    className="h-5 w-5 text-blue-600"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {device.name}
                    </h3>
                    <p className="text-xs text-gray-500 capitalize">
                      {device.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${getStatusColor(
                    device.status
                  )}`}
                >
                  {getStatusIcon(device.status)}
                  <span className="capitalize font-medium">
                    {device.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Power</span>
                  <span
                    className={`text-sm font-semibold ${
                      device.powerConsumption < 0
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {device.powerConsumption < 0 ? '+' : ''}
                    {Math.abs(device.powerConsumption)}W
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Last Seen</span>
                  <span className="text-xs text-gray-700">
                    {device.lastSeen}
                  </span>
                </div>

                {device.attributes &&
                  Object.keys(device.attributes).length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(device.attributes)
                          .slice(0, 2)
                          .map(([key, value]) => (
                            <Badge
                              key={key}
                              variant="secondary"
                              className="text-xs"
                            >
                              {key}: {value}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
