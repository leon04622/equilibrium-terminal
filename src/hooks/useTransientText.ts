"use client";

import { useEffect, useRef } from "react";

/** Writes text directly to a DOM node — bypasses React reconciliation for hot paths. */
export function useTransientText<T extends HTMLElement>(
  value: string,
  flashClass?: string,
) {
  const ref = useRef<T>(null);
  const prev = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.textContent !== value) el.textContent = value;
    if (flashClass && prev.current !== value) {
      el.classList.remove("animate-flash-up", "animate-flash-down");
      void el.offsetWidth;
      el.classList.add(flashClass);
      const t = window.setTimeout(() => el.classList.remove(flashClass), 450);
      prev.current = value;
      return () => window.clearTimeout(t);
    }
    prev.current = value;
  }, [value, flashClass]);

  return ref;
}
