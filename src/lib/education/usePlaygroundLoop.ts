"use client";

import { useEffect, useState } from "react";

/**
 * ACADEMY FRAMEWORK V1 — playground animation loop with guaranteed cleanup.
 * Pauses when `animate` is false (reduced motion or lesson paused).
 */
export function usePlaygroundLoop(
  steps: number,
  intervalMs: number,
  animate: boolean,
  rest = 0,
  sceneKey = "",
): number {
  const [step, setStep] = useState(rest);

  useEffect(() => {
    setStep(rest);
    if (!animate || steps <= 1) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % steps), intervalMs);
    return () => window.clearInterval(id);
  }, [steps, intervalMs, animate, rest, sceneKey]);

  return animate ? step : rest;
}
