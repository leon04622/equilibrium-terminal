import { useMemo } from "react";

/** Instant render when background hook is deferred or panel is freshly pinned. */
export function useConsoleSnapshot<T>(
  storeSnapshot: T | null,
  factory: () => T,
): T | null {
  const fallback = useMemo(() => {
    if (storeSnapshot) return null;
    try {
      return factory();
    } catch {
      return null;
    }
  }, [storeSnapshot]);
  return storeSnapshot ?? fallback;
}
