import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '../services/api/client';
import { errorHandler } from '../services/api/errorHandler';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiState<T> {
  const { immediate = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        const errorDetails = errorHandler.handle(response, { showToast: false });
        setError(errorDetails.message);
        if (onError) {
          onError(errorDetails.message);
        }
      }
    } catch (err) {
      const errorDetails = errorHandler.handle(err, { showToast: false });
      setError(errorDetails.message);
      if (onError) {
        onError(errorDetails.message);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    refetch: execute
  };
}

export interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (variables?: any) => Promise<T | null>;
  reset: () => void;
}

export interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useMutation<T, V = any>(
  mutationFn: (variables: V) => Promise<ApiResponse<T>>,
  options: UseMutationOptions<T> = {}
): UseMutationState<T> {
  const { onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (variables?: V): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mutationFn(variables as V);
      
      if (response.success && response.data) {
        setData(response.data);
        if (onSuccess) {
          onSuccess(response.data);
        }
        return response.data;
      } else {
        const errorDetails = errorHandler.handle(response, { showToast: false });
        setError(errorDetails.message);
        if (onError) {
          onError(errorDetails.message);
        }
        return null;
      }
    } catch (err) {
      const errorDetails = errorHandler.handle(err, { showToast: false });
      setError(errorDetails.message);
      if (onError) {
        onError(errorDetails.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset
  };
}

// Specialized hooks for common patterns
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<{ data: T[]; pagination: any }>>,
  initialPage = 1,
  initialLimit = 10
) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [allData, setAllData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  const { data, loading, error, refetch } = useApi(
    () => apiCall(page, limit),
    {
      onSuccess: (response) => {
        if (page === 1) {
          setAllData(response.data);
        } else {
          setAllData(prev => [...prev, ...response.data]);
        }
        setPagination(response.pagination);
      }
    }
  );

  const loadMore = useCallback(() => {
    if (pagination && page < pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  }, [pagination, page]);

  const refresh = useCallback(() => {
    setPage(1);
    setAllData([]);
    refetch();
  }, [refetch]);

  return {
    data: allData,
    pagination,
    loading,
    error,
    loadMore,
    refresh,
    hasMore: pagination ? page < pagination.totalPages : false
  };
}

export function useInfiniteScroll<T>(
  apiCall: (page: number) => Promise<ApiResponse<{ data: T[]; hasMore: boolean }>>,
  options: { threshold?: number } = {}
) {
  const { threshold = 100 } = options;
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { loading, error } = useApi(
    () => apiCall(page),
    {
      onSuccess: (response) => {
        setAllData(prev => page === 1 ? response.data : [...prev, ...response.data]);
        setHasMore(response.hasMore);
      }
    }
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  // Auto-load more when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - threshold
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, threshold]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore
  };
}