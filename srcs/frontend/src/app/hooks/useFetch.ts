/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

interface UseFetchOptions {
  skip?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching data from API endpoints
 * Handles loading, error states, and provides refetch functionality
 */
export function useFetch<T = any>(url: string, options: UseFetchOptions = {}): UseFetchResult<T> {
  const { skip = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (skip) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);

        if (onSuccess) {
          onSuccess(result);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch data");
        setError(error);

        if (onError) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, skip, refetchTrigger, onSuccess, onError]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { data, isLoading, error, refetch };
}

/**
 * Hook for making authenticated API requests
 */
export function useAuthFetch<T = any>(
  url: string,
  token: string | null,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { skip = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (skip || !token) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);

        if (onSuccess) {
          onSuccess(result);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch data");
        setError(error);

        if (onError) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, token, skip, refetchTrigger, onSuccess, onError]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { data, isLoading, error, refetch };
}
