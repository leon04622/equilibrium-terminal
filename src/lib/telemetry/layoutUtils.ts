import type { Layout } from "react-grid-layout";

/** Stable fingerprint for layout equality — prevents react-grid-layout update loops. */
export function layoutFingerprint(layout: Layout[]): string {
  const sorted = [...layout].sort((a, b) => a.i.localeCompare(b.i));
  return sorted
    .map((item) => `${item.i}:${item.x},${item.y},${item.w},${item.h}`)
    .join("|");
}

export function layoutsEqual(a: Layout[], b: Layout[]): boolean {
  return layoutFingerprint(a) === layoutFingerprint(b);
}
