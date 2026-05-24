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
  const onErrorRef = useRef(onError);
  const [dependency0, dependency1, dependency2, dependency3, dependency4] = dependencies;

  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!enabled) {
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
          if (onErrorRef.current) {
            onErrorRef.current(error);
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
  }, [
    enabled,
    dependencies.length,
    dependency0,
    dependency1,
    dependency2,
    dependency3,
    dependency4,
  ]);

  return enabled ? isLoading : false;
}
