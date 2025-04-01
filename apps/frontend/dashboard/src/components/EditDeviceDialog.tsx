import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Device } from '@/types/device';

interface EditDeviceDialogProps {
  device: Device | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (device: Device) => Promise<void>;
}

export function EditDeviceDialog({
  device,
  open,
  onOpenChange,
  onSubmit,
}: EditDeviceDialogProps) {
  const [editedDevice, setEditedDevice] = useState<Device | null>(null);

  useEffect(() => {
    if (device) {
      setEditedDevice(device);
    }
  }, [device]);

  if (!editedDevice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(editedDevice);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editedDevice.name}
              onChange={(e) =>
                setEditedDevice({ ...editedDevice, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={editedDevice.type}
              onChange={(e) =>
                setEditedDevice({ ...editedDevice, type: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={editedDevice.status}
              onValueChange={(value: Device['status']) =>
                setEditedDevice({ ...editedDevice, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 