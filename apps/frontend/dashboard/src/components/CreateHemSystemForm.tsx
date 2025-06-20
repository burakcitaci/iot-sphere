import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubDevice {
  id: string;
  name: string;
  type: 'solar_panel' | 'battery' | 'heat_pump' | 'ev_charger' | 'smart_meter' | 'inverter';
  status: 'online' | 'offline' | 'warning' | 'error';
  powerConsumption: number;
  lastSeen: string;
  attributes?: Record<string, any>;
}

interface HemsSystem {
  id: string;
  customerName: string;
  systemName: string;
  location: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  totalPower: number;
  deviceCount: number;
  lastUpdate: string;
  subDevices: SubDevice[];
}

interface CreateHemsSystemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (system: HemsSystem) => void;
}

export function CreateHemsSystemForm({ isOpen, onClose, onSubmit }: CreateHemsSystemFormProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    systemName: '',
    location: '',
    status: 'online' as const,
    totalPower: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSystem: HemsSystem = {
      id: `hems-${Date.now()}`,
      customerName: formData.customerName,
      systemName: formData.systemName,
      location: formData.location,
      status: formData.status,
      totalPower: formData.totalPower,
      deviceCount: 0,
      lastUpdate: "Just now",
      subDevices: []
    };

    onSubmit(newSystem);
    
    // Reset form
    setFormData({
      customerName: '',
      systemName: '',
      location: '',
      status: 'online',
      totalPower: 0
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Create New HEMS System</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Name
            </label>
            <input
              type="text"
              value={formData.systemName}
              onChange={(e) => handleInputChange('systemName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Power (W)
            </label>
            <input
              type="number"
              value={formData.totalPower}
              onChange={(e) => handleInputChange('totalPower', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="0"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Create System
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}