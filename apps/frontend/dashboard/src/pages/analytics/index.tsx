import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDevices } from "@/hooks/useDevices";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { BarChart } from "@/components/bar-chart";
import { PieChart } from "@/components/pie-chart";

export function AnalyticsPage() {
  const { devices } = useDevices();

  // Calculate metrics
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = devices.filter(d => d.status === 'offline').length;
  const deviceTypes = devices.reduce((acc, device) => {
    acc[device.type] = (acc[device.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDevices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{onlineDevices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offline Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{offlineDevices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Device Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(deviceTypes).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Status Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartAreaInteractive />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={Object.entries(deviceTypes).map(([type, count]) => ({
                name: type,
                value: count
              }))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={devices.map(device => ({
                name: device.name,
                lastSeen: new Date(device.lastSeen).toLocaleString()
              }))} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 