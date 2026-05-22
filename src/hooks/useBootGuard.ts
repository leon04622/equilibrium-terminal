"use client";

import { useEffect, useState } from "react";

/** Delays heavy subsystems until after first paint to avoid mount-time update storms. */
export function useBootGuard(delayMs = 400): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);

  return ready;
}
