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

/**
 * Staggered boot phases for background systems.
 * -1 = not ready, 0 = essentials, 1 = layout-gated hooks.
 */
export function useBootPhase(essentialMs = 400, fullMs = 1_800): number {
  const [phase, setPhase] = useState(-1);

  useEffect(() => {
    const essential = window.setTimeout(() => setPhase(0), essentialMs);
    const full = window.setTimeout(() => setPhase(1), fullMs);
    return () => {
      window.clearTimeout(essential);
      window.clearTimeout(full);
    };
  }, [essentialMs, fullMs]);

  return phase;
}
