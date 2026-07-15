/** Hyperliquid referral / builder rewards info response (subset). */

export interface HlReferralState {
  referredBy?: { referrer: string; code: string } | null;
  cumVlm?: string;
  unclaimedRewards?: string;
  claimedRewards?: string;
  builderRewards?: string;
  referrerState?: unknown;
  rewardHistory?: unknown;
  tokenToState?: unknown;
}

export function parseHlUsdAmount(raw: string | undefined | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export function formatHlUsd(raw: string | undefined | null): string {
  const n = parseHlUsdAmount(raw);
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}k`;
  if (n >= 1_000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}
