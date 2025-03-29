import React, { useState, useEffect } from 'react';
import { useDevices } from '../hooks/useDevices';
import { CreateDeviceDto, UpdateDeviceDto } from '../hooks/useDevices';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function DeviceList() {
  const { devices = [], error, isLoading, createDevice, updateDevice, deleteDevice, mutate } = useDevices();
  const [newDevice, setNewDevice] = useState<CreateDeviceDto>({ name: '', type: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [updatingOnlineId, setUpdatingOnlineId] = useState<string | null>(null);
  const [updatingOfflineId, setUpdatingOfflineId] = useState<string | null>(null);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);

  // Effect to handle device updates
  useEffect(() => {
    if (devices) {
      // You can add any side effects here that should happen when devices change
      console.log('Devices updated:', devices);
    }
  }, [devices]);

  const handleCreateDevice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newDevice.name || !newDevice.type) return;

    try {
      setIsCreating(true);
      const response = await createDevice(newDevice);
      if (response) {
        setNewDevice({ name: '', type: '' });
      }
    } catch (error) {
      console.error('Failed to create device:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateDevice = async (id: string, data: UpdateDeviceDto) => {
    try {
      if (data.status === 'online') {
        setUpdatingOnlineId(id);
      } else {
        setUpdatingOfflineId(id);
      }
      await updateDevice(id, data);
    } catch (error) {
      console.error('Failed to update device:', error);
    } finally {
      if (data.status === 'online') {
        setUpdatingOnlineId(null);
      } else {
        setUpdatingOfflineId(null);
      }
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      setDeletingDeviceId(id);
      await deleteDevice(id);
    } catch (error) {
      console.error('Failed to delete device:', error);
    } finally {
      setDeletingDeviceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Device</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateDevice} className="flex gap-4">
            <Input
              type="text"
              value={newDevice.name}
              onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
              placeholder="Device name"
              disabled={isCreating}
              required
            />
            <Input
              type="text"
              value={newDevice.type}
              onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
              placeholder="Device type"
              disabled={isCreating}
              required
            />
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Adding...' : 'Add Device'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3 grid grid-cols-1 gap-4 px-4">
        {devices.map((device) => (
          <Card key={device.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{device.name}</CardTitle>
                <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                  {device.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Type: {device.type}</p>
                <p className="text-sm text-muted-foreground">
                  Last seen: {new Date(device.lastSeen).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateDevice(device.id, { status: 'online' })}
                    disabled={updatingOnlineId === device.id}
                  >
                    {updatingOnlineId === device.id ? 'Updating...' : 'Set Online'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateDevice(device.id, { status: 'offline' })}
                    disabled={updatingOfflineId === device.id}
                  >
                    {updatingOfflineId === device.id ? 'Updating...' : 'Set Offline'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDevice(device.id)}
                    disabled={deletingDeviceId === device.id}
                  >
                    {deletingDeviceId === device.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 