import { useState } from 'react';
import { useDevices } from '@/hooks/useDevices';
import { Device, CreateDeviceDto } from '@/types/device';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { CreateDeviceDialog } from './CreateDeviceDialog';
import { EditDeviceDialog } from './EditDeviceDialog';
import { DeleteDeviceDialog } from './DeleteDeviceDialog';
import { DeviceDataTable } from './DeviceDataTable';

export function DeviceList() {
  const { devices, isLoading, createDevice, updateDevice, deleteDevice } = useDevices();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);

  const handleCreateDevice = async (device: CreateDeviceDto) => {
    await createDevice(device);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateDevice = async (device: Device) => {
    await updateDevice(device.id, device);
    setEditingDevice(null);
  };

  const handleDeleteDevice = async (device: Device) => {
    await deleteDevice(device.id);
    setDeletingDevice(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span></span>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </div>

      <DeviceDataTable data={devices} />

      <CreateDeviceDialog
        open={isCreateDialogOpen}
        onOpenChange={(open: boolean) => setIsCreateDialogOpen(open)}
        onSubmit={handleCreateDevice}
      />

      <EditDeviceDialog
        device={editingDevice}
        open={!!editingDevice}
        onOpenChange={(open: boolean) => !open && setEditingDevice(null)}
        onSubmit={handleUpdateDevice}
      />

      <DeleteDeviceDialog
        device={deletingDevice}
        open={!!deletingDevice}
        onOpenChange={(open: boolean) => !open && setDeletingDevice(null)}
        onSubmit={handleDeleteDevice}
      />
    </div>
  );
} 