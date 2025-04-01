export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline';
  lastSeen: string;
  metadata: Record<string, any>;
}

export interface CreateDeviceDto {
  name: string;
  type: string;
  metadata?: Record<string, any>;
}

export interface UpdateDeviceDto {
  name?: string;
  type?: string;
  status?: 'online' | 'offline';
  lastSeen?: string;
  metadata?: Record<string, any>;
} 