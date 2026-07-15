import { ensureWireSeeded } from "@/lib/distribution/wireSeed";
import { useTerminalStore } from "@/store/terminalStore";
import type {
  InstitutionalNewsHeadline,
  InstitutionalNewsStatus,
} from "@/types/institutional-news";

export function headlinesFromHlIntelligence(): InstitutionalNewsHeadline[] {
  const intel = useTerminalStore.getState().intelligence;
  const now = Date.now();
  return intel.slice(0, 20).map((item, i) => ({
    id: `hl-intel-${item.id}`,
    headline: item.title.slice(0, 140),
    detail: item.detail?.slice(0, 200) ?? item.title,
    source: "Hyperliquid tape",
    tier: "hl" as const,
    timestamp: item.timestamp || now - i * 1000,
    coin: item.coin ?? null,
    url: null,
    verified: true,
    priority: 40 + Math.min(30, Math.round((item.notionalUsd ?? 0) / 50_000)),
  }));
}

export function freeTierNewsStatus(headlineCount: number): InstitutionalNewsStatus {
  return {
    feedId: "eq-free-tier-wire",
    rssSourceCount: 0,
    rssLiveCount: 0,
    squawkConnected: false,
    squawkBuffered: 0,
    squawkAuthenticated: false,
    cryptoPanicEnabled: false,
    cryptoPanicLive: false,
    cryptoPanicCount: 0,
    macroFredEnabled: headlineCount > 0,
    macroFredLiveCount: 0,
    macroTreasuryLive: false,
    hlWireLiveCount: headlineCount,
    lastFetchAt: Date.now(),
    tiers: headlineCount > 0 ? ["hl", "macro"] : [],
  };
}

/** Merge API, FRED client, and HL intelligence when institutional keys are absent. */
export async function resolveClientNewsFallback(
  existing: InstitutionalNewsHeadline[],
): Promise<{ headlines: InstitutionalNewsHeadline[]; status: InstitutionalNewsStatus }> {
  const ids = new Set(existing.map((h) => h.id));
  let headlines = [...existing];

  if ((headlines.length) < 8) {
    const { fetchClientFredMacroHeadlines } = await import(
      "@/lib/infrastructure/client/fredClientMacro"
    );
    const fred = await fetchClientFredMacroHeadlines();
    for (const h of fred) {
      if (!ids.has(h.id)) {
        ids.add(h.id);
        headlines.push(h);
      }
    }
  }

  const hl = headlinesFromHlIntelligence();
  for (const h of hl) {
    if (!ids.has(h.id)) {
      ids.add(h.id);
      headlines.push(h);
    }
  }

  headlines = headlines
    .sort((a, b) => b.priority - a.priority || b.timestamp - a.timestamp)
    .slice(0, 64);

  ensureWireSeeded();

  return {
    headlines,
    status: freeTierNewsStatus(headlines.length),
  };
}
