import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: {
    message: string;
    statusCode: number;
    timestamp: string;
  } | null;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-semibold">Error {error.statusCode}</h3>
      </div>
      <p className="mt-2 text-sm">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
        >
          Try Again
        </button>
      )}
    </div>
  );
}; 