import { DeviceList } from '@/components/DeviceList';

export function DevicesPage() {
  return (
    <div className="container mx-auto gap-2">
      <div className="space-y-6">
        <h1 className="mb-6 text-2xl font-bold px-4">Devices</h1>
        <div className="px-4">
          <DeviceList />
        </div>
      </div>
    </div>
  );
} 