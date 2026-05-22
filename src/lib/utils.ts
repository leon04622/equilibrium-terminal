import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: decimals });
  if (abs >= 1) return value.toFixed(decimals);
  if (abs >= 0.01) return value.toFixed(4);
  return value.toFixed(6);
}

export function formatSize(value: number, decimals = 4): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(decimals);
}

export function formatSpreadBps(bps: number | null): string {
  if (bps === null || !Number.isFinite(bps)) return "—";
  return `${bps.toFixed(2)} bps`;
}
