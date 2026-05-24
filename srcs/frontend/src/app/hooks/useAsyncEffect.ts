import { DependencyList, useEffect, useRef, useState } from "react";

type AsyncEffectContext = {
  isCancelled: () => boolean;
};

type UseAsyncEffectOptions = {
  enabled?: boolean;
  onError?: (error: unknown) => void;
};

export function useAsyncEffect(
  effect: (context: AsyncEffectContext) => Promise<void> | void,
  dependencies: DependencyList,
  options: UseAsyncEffectOptions = {}
) {
  const { enabled = true, onError } = options;
  const [isLoading, setIsLoading] = useState(enabled);
  const effectRef = useRef(effect);

  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);

      try {
        await effectRef.current({
          isCancelled: () => cancelled,
        });
      } catch (error) {
        if (!cancelled) {
          if (onError) {
            onError(error);
          } else {
            console.error("Async effect failed", error);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [enabled, ...dependencies]);

  return isLoading;
}
