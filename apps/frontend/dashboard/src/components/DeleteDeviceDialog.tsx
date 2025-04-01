import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Device } from '@/types/device';

interface DeleteDeviceDialogProps {
  device: Device | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (device: Device) => Promise<void>;
}

export function DeleteDeviceDialog({
  device,
  open,
  onOpenChange,
  onSubmit,
}: DeleteDeviceDialogProps) {
  if (!device) return null;

  const handleSubmit = async () => {
    await onSubmit(device);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Device</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the device "{device.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleSubmit}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 