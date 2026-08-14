import { useEffect, useState } from "react";
import type { DependencyList } from "react";

interface UseFetchResult<T> {
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
}

// Plain fetch-on-mount/deps-change replacement for `useSWR` — same
// { data, error, isLoading } shape SWR returned, no external dependency.
// Pass `enabled: false` to skip fetching (mirrors SWR's conditional-key trick).
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
  enabled = true
): UseFetchResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<unknown>(undefined);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(undefined);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return { data, error, isLoading };
}
