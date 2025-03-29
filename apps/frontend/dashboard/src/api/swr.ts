import useSWR, { SWRConfiguration, KeyedMutator } from 'swr';
import { fetchClient } from './fetchClient';
import { ApiError } from '../types/api';

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 5000, // 5 seconds between retries
  shouldRetryOnError: (error) => {
    // Don't retry on 404 errors
    if (error.status === 404) return false;
    return true;
  }
};

export interface SWRResponse<T, E = ApiError> {
  data?: T;
  error?: E;
  isLoading: boolean;
  mutate: KeyedMutator<T>;
}

export function useGet<T>(url: string, config?: SWRConfiguration): SWRResponse<T> {
  return useSWR<T>(
    url,
    async () => {
      const response = await fetchClient.get<T>(url);
      return response;
    },
    { ...swrConfig, ...config }
  );
}

export function usePost<T, R = any>(url: string, config?: SWRConfiguration): Omit<SWRResponse<T>, 'mutate'> & { mutate: (data: R) => Promise<T | undefined> } {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    null,
    { ...swrConfig, ...config }
  );

  const postData = async (postData: R) => {
    const response = await fetchClient.post<T>(url, postData);
    await mutate(response, false);
    return response;
  };

  return {
    data,
    error,
    isLoading,
    mutate: postData,
  };
}

export function usePut<T, R = any>(url: string, config?: SWRConfiguration): Omit<SWRResponse<T>, 'mutate'> & { mutate: (data: R) => Promise<T | undefined> } {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    null,
    { ...swrConfig, ...config }
  );

  const putData = async (putData: R) => {
    const response = await fetchClient.put<T>(url, putData);
    await mutate(response, false);
    return response;
  };

  return {
    data,
    error,
    isLoading,
    mutate: putData,
  };
}

export function useDelete<T>(url: string, config?: SWRConfiguration): Omit<SWRResponse<T>, 'mutate'> & { mutate: () => Promise<T | undefined> } {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    null,
    { ...swrConfig, ...config }
  );

  const deleteData = async () => {
    const response = await fetchClient.delete<T>(url);
    await mutate(response, false);
    return response;
  };

  return {
    data,
    error,
    isLoading,
    mutate: deleteData,
  };
}

export type MutateFunction<T, R = any> = (data: R, options?: { revalidate?: boolean }) => Promise<T>; 