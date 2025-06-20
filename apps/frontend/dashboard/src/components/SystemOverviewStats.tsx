import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Battery, Thermometer, TrendingUp } from 'lucide-react';

interface SystemOverviewStatsProps {
  system: any;
}

export function SystemOverviewStats({ system }: SystemOverviewStatsProps) {
  const totalGeneration = Math.abs(system.subDevices
    .filter((d: any) => d.powerConsumption < 0)
    .reduce((sum: number, d: any) => sum + d.powerConsumption, 0));
  
  const totalConsumption = system.subDevices
    .filter((d: any) => d.powerConsumption > 0)
    .reduce((sum: number, d: any) => sum + d.powerConsumption, 0);
  
  const netPower = totalGeneration - totalConsumption;
  const efficiency = totalGeneration > 0 ? ((totalGeneration - totalConsumption) / totalGeneration * 100) : 0;

  const stats = [
    {
      title: 'Total Generation',
      value: `${(totalGeneration/1000).toFixed(1)}kW`,
      icon: <Zap className="h-6 w-6 text-green-600" />,
      change: '+12.5%',
      changeType: 'positive' as const,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Total Consumption',
      value: `${(totalConsumption/1000).toFixed(1)}kW`,
      icon: <Battery className="h-6 w-6 text-blue-600" />,
      change: '-3.2%',
      changeType: 'positive' as const,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Net Power',
      value: `${netPower >= 0 ? '+' : ''}${(netPower/1000).toFixed(1)}kW`,
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      change: '+8.1%',
      changeType: 'positive' as const,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'System Efficiency',
      value: `${efficiency.toFixed(1)}%`,
      icon: <Thermometer className="h-6 w-6 text-orange-600" />,
      change: '+2.3%',
      changeType: 'positive' as const,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.bgColor} ${stat.borderColor} border-1 rounded-sm`}>
          <CardContent className="px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-xs font-medium mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last hour
                </p>
              </div>
              <div className="p-3 rounded-full bg-white">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}