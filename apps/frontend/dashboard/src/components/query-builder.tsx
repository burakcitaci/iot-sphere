import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { Query } from './common/utils';


interface QueryBuilderProps {
  queries: Query[];
  onUpdateQuery: (id: number, updates: any) => void;
  onAddQuery: () => void;
  onRemoveQuery: (id: number) => void;
}

export const QueryBuilder = ({ queries, onUpdateQuery, onAddQuery, onRemoveQuery }: QueryBuilderProps) => {
  const metrics = [
    'system.cpu.user',
    'system.cpu.system',
    'system.memory.used',
    'system.memory.free',
    'system.disk.used',
    'system.network.bytes_sent',
    'system.network.bytes_rcvd',
    'application.requests.rate',
    'application.response.time',
    'database.connections.active'
  ];

  const aggregations = ['avg', 'sum', 'min', 'max', 'count', 'rate'];
  const groupByOptions = ['everything', 'host', 'service', 'environment', 'region'];

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          Queries
          <Button
            onClick={onAddQuery}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Query
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {queries.map((query, index) => (
          <div key={query.id} className="p-4 bg-gray-50 rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={`${
                  index === 0 ? 'bg-blue-100 text-blue-700' :
                  index === 1 ? 'bg-green-100 text-green-700' :
                  index === 2 ? 'bg-purple-100 text-purple-700' :
                  'bg-orange-100 text-orange-700'
                }`}
              >
                Query {String.fromCharCode(65 + index)}
              </Badge>
              {queries.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveQuery(query.id)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Metric</label>
                <Select 
                  value={query.metric} 
                  onValueChange={(value) => onUpdateQuery(query.id, { metric: value })}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {metrics.map((metric) => (
                      <SelectItem key={metric} value={metric}>
                        {metric}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Aggregation</label>
                  <Select 
                    value={query.aggregation} 
                    onValueChange={(value) => onUpdateQuery(query.id, { aggregation: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {aggregations.map((agg) => (
                        <SelectItem key={agg} value={agg}>
                          {agg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Group by</label>
                  <Select 
                    value={query.groupBy} 
                    onValueChange={(value) => onUpdateQuery(query.id, { groupBy: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {groupByOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
