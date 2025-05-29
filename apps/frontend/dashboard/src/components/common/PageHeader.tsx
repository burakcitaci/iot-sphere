import React from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  autoRefresh: boolean;
  onAutoRefreshChange: (enabled: boolean) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const PageHeader = ({ 
  title, 
  description, 
  autoRefresh, 
  onAutoRefreshChange, 
  onRefresh, 
  isLoading = false 
}: PageHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
            autoRefresh ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            {autoRefresh ? (
              <Wifi className="mr-1 h-3 w-3 text-green-600" />
            ) : (
              <WifiOff className="mr-1 h-3 w-3 text-gray-600" />
            )}
            <span className={autoRefresh ? 'text-green-600' : 'text-gray-600'}>
              {autoRefresh ? 'Live' : 'Manual'}
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => onAutoRefreshChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
            />
            <span className="text-xs text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-800 rounded px-2 py-1 text-xs hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-xs mt-1">{description}</p>
    </div>
  );
};
