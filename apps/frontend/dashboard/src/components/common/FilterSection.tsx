
import React, { useState } from 'react';
import { Filter } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const FilterSection = ({ title, children, defaultOpen = true }: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-4">
      <button 
        className="w-full font-medium text-gray-800 mb-2 flex items-center gap-1.5 text-sm hover:text-gray-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter className="h-3 w-3" />
        {title}
        <span className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && children}
    </div>
  );
};
