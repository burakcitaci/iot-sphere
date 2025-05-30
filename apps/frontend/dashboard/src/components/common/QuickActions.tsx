import { Query } from "./utils";

interface QuickActionsProps {
  onSetQueries: (queries: Query[]) => void;
}

export const QuickActions = ({ onSetQueries }: QuickActionsProps) => {
  const createQuickQuery = (metric: string, aggregation: string, groupBy: string) => {
    return {
      id: Date.now(),
      metric,
      aggregation,
      groupBy,
      filters: []
    };
  };

  return (
    <div className="mt-3 bg-white rounded border border-gray-200 p-3 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick HTTP Metric Queries</h4>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSetQueries([createQuickQuery('http_requests_total', 'rate', 'method')])}
          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200"
        >
          Request Rate by Method
        </button>
        <button
          onClick={() => onSetQueries([createQuickQuery('http_requests_total', 'rate', 'status_code')])}
          className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200"
        >
          Request Rate by Status
        </button>
        <button
          onClick={() => onSetQueries([createQuickQuery('http_requests_total', 'rate', 'route')])}
          className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200"
        >
          Request Rate by Route
        </button>
      </div>
    </div>
  );
};
