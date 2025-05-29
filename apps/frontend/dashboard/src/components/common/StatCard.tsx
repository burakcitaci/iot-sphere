import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  description?: string;
  icon: LucideIcon;
  isNegative?: boolean;
}

export const StatCard = ({ title, value, change, description, icon: Icon, isNegative = false }: StatCardProps) => {
  return (
    <div className="bg-white rounded border border-gray-200 px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${isNegative ? 'text-red-600' : 'text-blue-600'}`} />
          <span className="text-xs text-gray-500">{title}</span>
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
            isNegative 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {isNegative ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {change}
          </div>
        )}
      </div>
      <div className="text-sm font-medium text-gray-800">{value}</div>
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
    </div>
  );
};
