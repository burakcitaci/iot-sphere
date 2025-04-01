import { useState } from 'react';
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
import { CreateDeviceDto } from '@/types/device';

interface CreateDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (device: CreateDeviceDto) => Promise<void>;
}

export function CreateDeviceDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateDeviceDialogProps) {
  const [device, setDevice] = useState<CreateDeviceDto>({
    name: '',
    type: '',
    metadata: {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(device);
    setDevice({
      name: '',
      type: '',
      metadata: {},
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={device.name}
              onChange={(e) => setDevice({ ...device, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={device.type}
              onChange={(e) => setDevice({ ...device, type: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Device</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 