import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipBack, SkipForward, Settings, Search } from 'lucide-react';
import { useState } from 'react';

interface MetricsHeaderProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const MetricsHeader = ({ timeRange, onTimeRangeChange }: MetricsHeaderProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const timeRanges = [
    { value: '5m', label: '5 minutes' },
    { value: '15m', label: '15 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '3h', label: '3 hours' },
    { value: '6h', label: '6 hours' },
    { value: '12h', label: '12 hours' },
    { value: '1d', label: '1 day' },
    { value: '7d', label: '7 days' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Metrics Explorer
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="default" className="bg-blue-500 text-white hover:bg-blue-600">
              Overview
            </Badge>
            <Badge variant="outline" className="hover:bg-gray-50">
              Explorer
            </Badge>
            <Badge variant="outline" className="hover:bg-gray-50">
              Summary
            </Badge>
            <Badge variant="outline" className="hover:bg-gray-50">
              Volume
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hover:bg-gray-50">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="hover:bg-gray-50"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-gray-50">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-32 bg-white border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="hover:bg-gray-50">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>
    </div>
  );
};