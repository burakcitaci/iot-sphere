import { useGet, usePost, usePut, useDelete, usePatch } from '../api/swr';
import { fetchClient } from '../api/fetchClient';
import { useApiError } from './useApiError';
import { ApiError } from '../types/api';
import { useEffect } from 'react';

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

// SWR-based hooks
export function useDevices() {
  const DEVICES_KEY = '/devices';
  const { data: devices = [], error, isLoading, mutate } = useGet<Device[]>(DEVICES_KEY);
  const { mutate: createDeviceMutate } = usePost<Device, CreateDeviceDto>(DEVICES_KEY);

  const createDevice = async (data: CreateDeviceDto) => {
    try {
      console.log('Creating device:', data);
      const response = await createDeviceMutate(data);
      if (!response) return;
      
      // Update the cache with the new device
      await mutate((currentDevices) => {
        const devices = Array.isArray(currentDevices) ? currentDevices : [];
        return [...devices, response];
      }, false);
      
      return response;
    } catch (error) {
      console.error('Failed to create device:', error);
      throw error;
    }
  };

  const updateDevice = async (id: string, data: UpdateDeviceDto) => {
    try {
      const response = await fetchClient.patch<Device>(`${DEVICES_KEY}/${id}`, data);
      if (!response) return;
      
      await mutate((currentDevices) => {
        const devices = Array.isArray(currentDevices) ? currentDevices : [];
        return devices.map((device) => device.id === id ? response : device);
      }, false);
      
      return response;
    } catch (error) {
      console.error('Failed to update device:', error);
      throw error;
    }
  };

  const deleteDevice = async (id: string) => {
    try {
      await fetchClient.delete<void>(`${DEVICES_KEY}/${id}`);
      
      await mutate((currentDevices) => {
        const devices = Array.isArray(currentDevices) ? currentDevices : [];
        return devices.filter((device) => device.id !== id);
      }, false);
    } catch (error) {
      console.error('Failed to delete device:', error);
      throw error;
    }
  };

  return {
    devices: Array.isArray(devices) ? devices : [],
    error: error as ApiError | undefined,
    isLoading,
    createDevice,
    updateDevice,
    deleteDevice,
    mutate,
  };
}

export function useDevice(id: string) {
  return useGet<Device>(`/devices/${id}`);
}

export function useCreateDevice() {
  return usePost<Device, CreateDeviceDto>('/devices');
}

export function useUpdateDevice(id: string) {
  return usePut<Device, UpdateDeviceDto>(`/devices/${id}`);
}

export function useDeleteDevice(id: string) {
  return useDelete<void>(`/devices/${id}`);
}

// Fetch-based hook with error handling
export function useDeviceManagement(): {
  error: ApiError | null;
  isLoading: boolean;
  createDevice: (data: CreateDeviceDto) => Promise<Device>;
  updateDevice: (id: string, data: UpdateDeviceDto) => Promise<Device>;
  deleteDevice: (id: string) => Promise<void>;
  getDevice: (id: string) => Promise<Device>;
  getDevices: () => Promise<Device[]>;
} {
  const { error, isLoading, withErrorHandling } = useApiError();

  const createDevice = async (data: CreateDeviceDto) => {
    return await withErrorHandling(() => 
      fetchClient.post<Device>('/devices', data)
    );
  };

  const updateDevice = async (id: string, data: UpdateDeviceDto) => {
    return await withErrorHandling(() => 
      fetchClient.put<Device>(`/devices/${id}`, data)
    );
  };

  const deleteDevice = async (id: string) => {
    return await withErrorHandling(() => 
      fetchClient.delete<void>(`/devices/${id}`)
    );
  };

  const getDevice = async (id: string) => {
    return await withErrorHandling(() => 
      fetchClient.get<Device>(`/devices/${id}`)
    );
  };

  const getDevices = async () => {
    return await withErrorHandling(() => 
      fetchClient.get<Device[]>('/devices')
    );
  };

  return {
    error,
    isLoading,
    createDevice,
    updateDevice,
    deleteDevice,
    getDevice,
    getDevices,
  };
} 