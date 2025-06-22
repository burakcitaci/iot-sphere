import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  X, 
  Filter, 
  ChevronDown,
  Play,
  Save,
  Copy,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
// Note: Using textarea from HTML instead of shadcn component if not available
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type QueryType = 'logs' | 'traces' | 'metrics';
export type AggregationType = 'count' | 'avg' | 'sum' | 'min' | 'max' | 'p50' | 'p95' | 'p99';

export interface QueryFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string;
  negate?: boolean;
}

export interface UnifiedQuery {
  id: string;
  name?: string;
  type: QueryType;
  query: string;
  filters: QueryFilter[];
  groupBy?: string[];
  aggregation?: AggregationType;
  isValid: boolean;
  errors?: string[];
}

interface UnifiedQueryBuilderProps {
  queries: UnifiedQuery[];
  onQueriesChange: (queries: UnifiedQuery[]) => void;
  onExecute: (queries: UnifiedQuery[]) => void;
  type: QueryType;
  className?: string;
}

const logFields = [
  'service.name', 'level', 'message', 'timestamp', 'trace_id', 'span_id',
  'host', 'environment', 'version', 'user_id', 'request_id'
];

const traceFields = [
  'service.name', 'operation.name', 'span.kind', 'status.code', 'duration',
  'trace_id', 'span_id', 'parent_span_id', 'resource.name', 'environment'
];

const metricFields = [
  'metric.name', 'service.name', 'host', 'environment', 'version',
  'instance', 'job', 'region', 'availability_zone'
];

const operators = [
  { value: 'equals', label: '=' },
  { value: 'contains', label: 'contains' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'gte', label: '>=' },
  { value: 'lte', label: '<=' }
];

const aggregations: AggregationType[] = ['count', 'avg', 'sum', 'min', 'max', 'p50', 'p95', 'p99'];

export const UnifiedQueryBuilder: React.FC<UnifiedQueryBuilderProps> = ({
  queries,
  onQueriesChange,
  onExecute,
  type,
  className
}) => {
  const [activeQuery, setActiveQuery] = useState<string>(queries[0]?.id || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [queryMode, setQueryMode] = useState<'builder' | 'raw'>('builder');

  const getFieldsForType = useCallback((queryType: QueryType) => {
    switch (queryType) {
      case 'logs': return logFields;
      case 'traces': return traceFields;
      case 'metrics': return metricFields;
      default: return [];
    }
  }, []);

  const addQuery = useCallback(() => {
    const newQuery: UnifiedQuery = {
      id: `query-${Date.now()}`,
      name: `Query ${queries.length + 1}`,
      type,
      query: '',
      filters: [],
      groupBy: [],
      isValid: true
    };
    
    onQueriesChange([...queries, newQuery]);
    setActiveQuery(newQuery.id);
  }, [queries, onQueriesChange, type]);

  const updateQuery = useCallback((id: string, updates: Partial<UnifiedQuery>) => {
    const updatedQueries = queries.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    onQueriesChange(updatedQueries);
  }, [queries, onQueriesChange]);

  const removeQuery = useCallback((id: string) => {
    const filteredQueries = queries.filter(q => q.id !== id);
    onQueriesChange(filteredQueries);
    
    if (activeQuery === id && filteredQueries.length > 0) {
      setActiveQuery(filteredQueries[0].id);
    }
  }, [queries, onQueriesChange, activeQuery]);

  const addFilter = useCallback((queryId: string) => {
    const newFilter: QueryFilter = {
      id: `filter-${Date.now()}`,
      field: getFieldsForType(type)[0],
      operator: 'equals',
      value: ''
    };

    updateQuery(queryId, {
      filters: [...(queries.find(q => q.id === queryId)?.filters || []), newFilter]
    });
  }, [queries, updateQuery, type, getFieldsForType]);

  const updateFilter = useCallback((queryId: string, filterId: string, updates: Partial<QueryFilter>) => {
    const query = queries.find(q => q.id === queryId);
    if (!query) return;

    const updatedFilters = query.filters.map(f => 
      f.id === filterId ? { ...f, ...updates } : f
    );

    updateQuery(queryId, { filters: updatedFilters });
  }, [queries, updateQuery]);

  const removeFilter = useCallback((queryId: string, filterId: string) => {
    const query = queries.find(q => q.id === queryId);
    if (!query) return;

    const filteredFilters = query.filters.filter(f => f.id !== filterId);
    updateQuery(queryId, { filters: filteredFilters });
  }, [queries, updateQuery]);

  const buildQueryString = useCallback((query: UnifiedQuery) => {
    let queryStr = '';
    
    if (query.filters.length > 0) {
      const filterParts = query.filters.map(filter => {
        const prefix = filter.negate ? '-' : '';
        switch (filter.operator) {
          case 'equals':
            return `${prefix}${filter.field}:${filter.value}`;
          case 'contains':
            return `${prefix}${filter.field}:*${filter.value}*`;
          case 'starts_with':
            return `${prefix}${filter.field}:${filter.value}*`;
          case 'ends_with':
            return `${prefix}${filter.field}:*${filter.value}`;
          default:
            return `${prefix}${filter.field}${filter.operator}${filter.value}`;
        }
      });
      queryStr = filterParts.join(' AND ');
    }

    if (query.groupBy && query.groupBy.length > 0) {
      queryStr += ` | group by ${query.groupBy.join(', ')}`;
    }

    if (query.aggregation && type === 'metrics') {
      queryStr += ` | ${query.aggregation}()`;
    }

    return queryStr;
  }, [type]);

  const currentQuery = queries.find(q => q.id === activeQuery);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Query Builder</CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={queryMode} onValueChange={(value) => setQueryMode(value as 'builder' | 'raw')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="raw">Raw Query</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Query Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {queries.map((query) => (
            <div
              key={query.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${
                activeQuery === query.id
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setActiveQuery(query.id)}
            >
              <span className="text-sm font-medium whitespace-nowrap">
                {query.name || `Query ${queries.indexOf(query) + 1}`}
              </span>
              {!query.isValid && (
                <AlertCircle className="h-3 w-3 text-red-500" />
              )}
              {queries.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeQuery(query.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addQuery}
            className="whitespace-nowrap"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Query
          </Button>
        </div>

        {currentQuery && (
          <div className="space-y-4">
            {queryMode === 'builder' ? (
              <>
                {/* Filters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Filters</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addFilter(currentQuery.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Filter
                    </Button>
                  </div>

                  {currentQuery.filters.map((filter) => (
                    <div key={filter.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Select
                        value={filter.field}
                        onValueChange={(value) => updateFilter(currentQuery.id, filter.id, { field: value })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getFieldsForType(type).map(field => (
                            <SelectItem key={field} value={field}>{field}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filter.operator}
                        onValueChange={(value) => updateFilter(currentQuery.id, filter.id, { operator: value as any })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(op => (
                            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="Value"
                        value={filter.value}
                        onChange={(e) => updateFilter(currentQuery.id, filter.id, { value: e.target.value })}
                        className="flex-1"
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateFilter(currentQuery.id, filter.id, { negate: !filter.negate })}
                        className={filter.negate ? 'text-red-600' : 'text-gray-400'}
                      >
                        {filter.negate ? 'NOT' : 'AND'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(currentQuery.id, filter.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {currentQuery.filters.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No filters applied</p>
                      <p className="text-xs text-gray-400">Add filters to refine your search</p>
                    </div>
                  )}
                </div>

                {/* Advanced Options */}
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="mb-3"
                  >
                    Advanced Options
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </Button>

                  {showAdvanced && (
                    <div className="grid grid-cols-2 gap-4">
                      {type === 'metrics' && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Aggregation
                          </label>
                          <Select
                            value={currentQuery.aggregation || ''}
                            onValueChange={(value) => updateQuery(currentQuery.id, { aggregation: value as AggregationType })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select aggregation" />
                            </SelectTrigger>
                            <SelectContent>
                              {aggregations.map(agg => (
                                <SelectItem key={agg} value={agg}>{agg}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Group By
                        </label>
                        <Select
                          onValueChange={(value) => {
                            const currentGroupBy = currentQuery.groupBy || [];
                            if (!currentGroupBy.includes(value)) {
                              updateQuery(currentQuery.id, { groupBy: [...currentGroupBy, value] });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add group by field" />
                          </SelectTrigger>
                          <SelectContent>
                            {getFieldsForType(type).map(field => (
                              <SelectItem key={field} value={field}>{field}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {currentQuery.groupBy && currentQuery.groupBy.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {currentQuery.groupBy.map((field) => (
                              <Badge key={field} variant="secondary" className="text-xs">
                                {field}
                                <button
                                  onClick={() => {
                                    const newGroupBy = currentQuery.groupBy?.filter(f => f !== field) || [];
                                    updateQuery(currentQuery.id, { groupBy: newGroupBy });
                                  }}
                                  className="ml-1 text-gray-500 hover:text-red-500"
                                >
                                  <X className="h-2 w-2" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 block">
                  Raw Query
                </label>
                <textarea
                  value={currentQuery.query || buildQueryString(currentQuery)}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuery(currentQuery.id, { query: e.target.value })}
                  placeholder={`Enter your ${type} query...`}
                  className="font-mono text-sm w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                <div className="text-xs text-gray-500">
                  Use the query language syntax for {type}. 
                  <button className="text-blue-600 hover:underline ml-1">
                    View documentation
                  </button>
                </div>
              </div>
            )}

            {/* Query Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Query Preview</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
              <code className="text-xs text-gray-800 block bg-white p-2 rounded border">
                {currentQuery.query || buildQueryString(currentQuery) || `No ${type} query defined`}
              </code>
            </div>

            {/* Execute Button */}
            <div className="flex justify-end">
              <Button 
                onClick={() => onExecute(queries)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Query
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 