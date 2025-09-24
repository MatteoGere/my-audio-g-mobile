import { useEffect, useState, useCallback } from 'react';

// Types for loading states
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

export interface LoadingManager {
  [key: string]: LoadingState;
}

// Hook for managing multiple loading states
export const useLoadingManager = () => {
  const [loadingStates, setLoadingStates] = useState<LoadingManager>({});

  const setLoading = useCallback(
    (key: string, isLoading: boolean, message?: string, progress?: number) => {
      setLoadingStates((prev) => ({
        ...prev,
        [key]: {
          isLoading,
          loadingMessage: message,
          progress,
        },
      }));
    },
    [],
  );

  const startLoading = useCallback(
    (key: string, message?: string) => {
      setLoading(key, true, message);
    },
    [setLoading],
  );

  const stopLoading = useCallback(
    (key: string) => {
      setLoading(key, false);
    },
    [setLoading],
  );

  const updateProgress = useCallback((key: string, progress: number, message?: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { isLoading: true }),
        progress,
        loadingMessage: message,
      },
    }));
  }, []);

  const clearAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  const isAnyLoading = Object.values(loadingStates).some((state) => state.isLoading);
  const getLoadingState = useCallback(
    (key: string) => loadingStates[key] || { isLoading: false },
    [loadingStates],
  );

  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    updateProgress,
    clearAll,
    isAnyLoading,
    getLoadingState,
  };
};

// Hook for simple boolean loading state
export const useLoading = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [message, setMessage] = useState<string | undefined>();

  const startLoading = useCallback((loadingMessage?: string) => {
    setIsLoading(true);
    setMessage(loadingMessage);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setMessage(undefined);
  }, []);

  return {
    isLoading,
    message,
    startLoading,
    stopLoading,
    setMessage,
  };
};

// Hook for tracking async operation progress
export const useAsyncOperation = <T = any>() => {
  const [state, setState] = useState<{
    isLoading: boolean;
    data: T | null;
    error: any;
    progress?: number;
    message?: string;
  }>({
    isLoading: false,
    data: null,
    error: null,
  });

  const execute = useCallback(
    async (
      operation: (onProgress?: (progress: number, message?: string) => void) => Promise<T>,
    ) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        progress: 0,
      }));

      try {
        const onProgress = (progress: number, message?: string) => {
          setState((prev) => ({
            ...prev,
            progress,
            message,
          }));
        };

        const result = await operation(onProgress);

        setState({
          isLoading: false,
          data: result,
          error: null,
          progress: 100,
        });

        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error,
        }));
        throw error;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      data: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

// Hook for debounced loading states (useful for search, etc.)
export const useDebouncedLoading = (delay: number = 300) => {
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedLoading(isLoading);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isLoading, delay]);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    isLoading: debouncedLoading,
    setLoading,
  };
};

// Hook for batch operations with individual item tracking
export const useBatchLoading = <T extends { id: string | number }>() => {
  const [itemStates, setItemStates] = useState<Record<string | number, LoadingState>>({});

  const setItemLoading = useCallback(
    (id: string | number, isLoading: boolean, message?: string) => {
      setItemStates((prev) => ({
        ...prev,
        [id]: {
          isLoading,
          loadingMessage: message,
        },
      }));
    },
    [],
  );

  const startItemLoading = useCallback(
    (id: string | number, message?: string) => {
      setItemLoading(id, true, message);
    },
    [setItemLoading],
  );

  const stopItemLoading = useCallback(
    (id: string | number) => {
      setItemLoading(id, false);
    },
    [setItemLoading],
  );

  const clearAllItems = useCallback(() => {
    setItemStates({});
  }, []);

  const getItemState = useCallback(
    (id: string | number) => {
      return itemStates[id] || { isLoading: false };
    },
    [itemStates],
  );

  const getLoadingItems = useCallback(() => {
    return Object.entries(itemStates)
      .filter(([, state]) => state.isLoading)
      .map(([id]) => id);
  }, [itemStates]);

  const isAnyItemLoading = Object.values(itemStates).some((state) => state.isLoading);

  return {
    itemStates,
    setItemLoading,
    startItemLoading,
    stopItemLoading,
    clearAllItems,
    getItemState,
    getLoadingItems,
    isAnyItemLoading,
  };
};

// Utility for loading indicators
export const getLoadingText = (
  isLoading: boolean,
  loadingText: string = 'Loading...',
  completeText?: string,
): string => {
  if (isLoading) return loadingText;
  return completeText || '';
};

// Progress bar utilities
export const formatProgress = (progress?: number): string => {
  if (typeof progress !== 'number') return '0%';
  return `${Math.round(Math.max(0, Math.min(100, progress)))}%`;
};

export const getProgressBarWidth = (progress?: number): string => {
  if (typeof progress !== 'number') return '0%';
  return formatProgress(progress);
};

// Loading state aggregation utilities
export const aggregateLoadingStates = (states: LoadingState[]): LoadingState => {
  const isLoading = states.some((state) => state.isLoading);
  const loadingStates = states.filter((state) => state.isLoading);

  if (!isLoading) {
    return { isLoading: false };
  }

  // If we have progress information, average it
  const progressStates = loadingStates.filter((state) => typeof state.progress === 'number');
  let progress: number | undefined;

  if (progressStates.length > 0) {
    const totalProgress = progressStates.reduce((sum, state) => sum + (state.progress || 0), 0);
    progress = totalProgress / progressStates.length;
  }

  // Use the most recent loading message
  const loadingMessage = loadingStates
    .reverse()
    .find((state) => state.loadingMessage)?.loadingMessage;

  return {
    isLoading: true,
    loadingMessage,
    progress,
  };
};
