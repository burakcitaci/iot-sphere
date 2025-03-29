import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  statusCode: number;
  timestamp: string;
}

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError;
      setError(apiError || {
        message: 'An unexpected error occurred',
        statusCode: error.response?.status || 500,
        timestamp: new Date().toISOString(),
      });
    } else {
      setError({
        message: 'An unexpected error occurred',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setIsLoading(true);
    clearError();
    try {
      const result = await operation();
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling,
  };
}; 