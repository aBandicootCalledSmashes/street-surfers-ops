import { useState, useCallback, useRef } from 'react';

interface UseLoadingStateOptions {
  preventDuplicates?: boolean;
  minLoadingTime?: number;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const { preventDuplicates = true, minLoadingTime = 200 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingActionRef = useRef<string | null>(null);

  const execute = useCallback(async <T,>(
    actionId: string,
    action: () => Promise<T>
  ): Promise<T | null> => {
    // Prevent duplicate submissions
    if (preventDuplicates && pendingActionRef.current === actionId) {
      return null;
    }

    pendingActionRef.current = actionId;
    setIsLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const result = await action();
      
      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
      pendingActionRef.current = null;
    }
  }, [preventDuplicates, minLoadingTime]);

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, execute, clearError };
}
