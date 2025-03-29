import React from 'react';
import { useGet, usePost } from '../api/swr';
import { fetchClient } from '../api/fetchClient';
import { Loading } from './Loading';
import { ErrorDisplay } from './ErrorDisplay';
import { useApiError } from '../hooks/useApiError';

interface Data {
  id: number;
  title: string;
  content: string;
}

export const ExampleComponent: React.FC = () => {
  // Using SWR
  const { data: swrData, error: swrError, isLoading: swrLoading } = useGet<Data[]>('/data');

  // Using fetch with error handling
  const { error: fetchError, isLoading: fetchLoading, withErrorHandling } = useApiError();
  const [data, setData] = React.useState<Data[]>([]);

  const fetchData = async () => {
    const result = await withErrorHandling(() => fetchClient.get<Data[]>('/data'));
    setData(result);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Example of POST with SWR
  const { mutate } = usePost<Data>('/data');

  if (swrLoading || fetchLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Data from SWR</h2>
      {swrError ? (
        <ErrorDisplay error={swrError} onRetry={() => mutate({ title: 'New Item', content: 'Content' })} />
      ) : (
        <div className="grid gap-4">
          {swrData?.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.content}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold">Data from Fetch</h2>
      {fetchError ? (
        <ErrorDisplay error={fetchError} onRetry={fetchData} />
      ) : (
        <div className="grid gap-4">
          {data.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 